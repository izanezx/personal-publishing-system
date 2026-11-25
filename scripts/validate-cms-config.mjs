#!/usr/bin/env node

import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import Ajv from "ajv";
import YAML from "yaml";

const cmsVersion = "0.272.0";
const schemaUrl = `https://unpkg.com/@sveltia/cms@${cmsVersion}/schema/sveltia-cms.json`;
const adminPath = resolve("public/admin/index.html");
const configPath = resolve("public/admin/config.yml");
const customScriptPath = resolve("public/admin/custom.js");
const [html, source, customScript, schemaResponse] = await Promise.all([
  readFile(adminPath, "utf8"),
  readFile(configPath, "utf8"),
  readFile(customScriptPath, "utf8"),
  fetch(schemaUrl, {
    headers: { Accept: "application/json", "Cache-Control": "no-cache" },
  }),
]);

if (!schemaResponse.ok) {
  throw new Error(
    `Could not load ${schemaUrl}: ${schemaResponse.status} ${schemaResponse.statusText}`
  );
}

const config = YAML.parse(source);
const schema = await schemaResponse.json();
const validate = new Ajv({
  allErrors: true,
  strict: false,
  validateFormats: false,
}).compile(schema);

if (!validate(config)) {
  const details = validate.errors
    .map(error => `${error.instancePath || "/"} ${error.message}`)
    .join("\n");
  throw new Error(`Sveltia CMS configuration is invalid:\n${details}`);
}

const requiredCollections = [
  "publications",
  "galleries",
  "editorial-pages",
  "tombstones",
];
for (const name of requiredCollections) {
  const collection = config.collections.find(
    candidate => candidate.name === name
  );
  if (!collection) {
    throw new Error(`Required Sveltia collection is missing: ${name}`);
  }
  if (collection.publish === false) {
    throw new Error(
      `${name} must expose the normal save control in the simple workflow`
    );
  }
}

if (config.backend?.repo !== "izanezx/personal-publishing-system") {
  throw new Error("Sveltia CMS targets an unexpected repository");
}
if (config.backend?.branch !== "main") {
  throw new Error("Sveltia CMS must save directly to main");
}
if (config.backend?.base_url !== "https://sveltia-auth.zanezx.com") {
  throw new Error("Sveltia CMS authentication Worker URL differs");
}
if (config.publish_mode !== "simple") {
  throw new Error("Sveltia CMS must use the simple workflow");
}
if (config.editor?.second_pane !== false || config.editor?.preview !== true) {
  throw new Error(
    "Sveltia CMS must keep a single-pane editor with optional preview"
  );
}
if (config.i18n?.default_locale !== "zh-cn") {
  throw new Error("Chinese must remain the default CMS locale");
}

for (const collectionName of ["publications", "galleries"]) {
  const collection = config.collections.find(
    candidate => candidate.name === collectionName
  );
  const slugField = collection?.fields?.find(field => field.name === "slug");
  const pattern = Array.isArray(slugField?.pattern)
    ? slugField.pattern[0]
    : slugField?.pattern;
  if (typeof pattern !== "string") {
    throw new Error(`${collectionName} must define a string slug pattern`);
  }
  const delimitedPattern = /^\/(.*)\/([a-z]*)$/.exec(pattern);
  let slugPattern;
  try {
    slugPattern = delimitedPattern
      ? new RegExp(delimitedPattern[1], delimitedPattern[2])
      : new RegExp(pattern);
  } catch (error) {
    throw new Error(`${collectionName} slug pattern is invalid: ${error}`);
  }
  for (const validSlug of ["color-study", "中文-文章", "notes"]) {
    if (!slugPattern.test(validSlug)) {
      throw new Error(
        `${collectionName} slug pattern rejects valid value: ${validSlug}`
      );
    }
  }
  for (const invalidSlug of [
    "-leading",
    "trailing-",
    "double--dash",
    "under_score",
    "nested/path",
    "two words",
  ]) {
    if (slugPattern.test(invalidSlug)) {
      throw new Error(
        `${collectionName} slug pattern accepts invalid value: ${invalidSlug}`
      );
    }
  }
}

const aria = html.match(/integrity="(sha384-[^"]+)"/)?.[1];
const scriptUrl = html.match(/src="([^"]+sveltia-cms\.js)"/)?.[1];
if (!aria || !scriptUrl || !scriptUrl.includes(`@sveltia/cms@${cmsVersion}/`)) {
  throw new Error("Sveltia CMS script version or SRI metadata is incomplete");
}
if (!html.includes('src="./custom.js"')) {
  throw new Error("Sveltia CMS custom script is not loaded by the admin page");
}
if (!customScript.includes("CMS.registerPreviewStyle")) {
  throw new Error("Sveltia CMS custom script must register preview styles");
}
if (!customScript.includes('id: "callout"')) {
  throw new Error("Sveltia CMS custom script must register the callout editor");
}

if (config.i18n?.omit_default_locale_from_preview_path !== true) {
  throw new Error("Chinese preview paths must omit the default locale");
}

for (const collectionName of ["publications", "galleries"]) {
  const collection = config.collections.find(
    candidate => candidate.name === collectionName
  );
  if (collection?.aliases_field !== "aliases") {
    throw new Error(`${collectionName} must use aliases_field: aliases`);
  }
  if (typeof collection?.preview_path !== "string") {
    throw new Error(`${collectionName} must define a preview_path`);
  }
  const fieldNames = new Set(
    collection.fields.map(field => field.name).filter(Boolean)
  );
  if (fieldNames.has("aliases")) {
    throw new Error(
      `${collectionName} must not define aliases when Sveltia maintains it`
    );
  }
  for (const fieldName of ["archivedAt", "expiresAt"]) {
    if (!fieldNames.has(fieldName)) {
      throw new Error(`${collectionName} is missing field: ${fieldName}`);
    }
  }
  const body = collection.fields.find(field => field.name === "body");
  for (const component of ["table", "hr", "callout"]) {
    if (!body?.editor_components?.includes(component)) {
      throw new Error(`${collectionName} body is missing ${component}`);
    }
  }
}

const scriptResponse = await fetch(scriptUrl);
if (!scriptResponse.ok) {
  throw new Error(
    `Could not load Sveltia CMS script: ${scriptResponse.status}`
  );
}
const digest = createHash("sha384")
  .update(Buffer.from(await scriptResponse.arrayBuffer()))
  .digest("base64");
if (`sha384-${digest}` !== aria) {
  throw new Error("Sveltia CMS script does not match its pinned SRI digest");
}

const r2 = config.media_libraries?.cloudflare_r2;
if (!r2?.bucket || !r2?.account_id || !r2?.public_url) {
  throw new Error("Cloudflare R2 media library configuration is incomplete");
}
if (
  process.env.CMS_REQUIRE_MEDIA_CREDENTIALS === "true" &&
  (!/^[0-9a-f]{32}$/.test(r2.access_key_id ?? "") ||
    /^0+$/.test(r2.access_key_id))
) {
  throw new Error(
    "Cloudflare R2 access_key_id is still a placeholder; create the scoped R2 token before deployment"
  );
}

process.stdout.write(
  `Verified Sveltia CMS ${cmsVersion} configuration, schema, simple workflow, R2 shape and SRI.\n`
);
