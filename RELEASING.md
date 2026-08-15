# Releasing Kurdel

Kurdel uses fixed versioning: every public package is released at the version
stored in `lerna.json`. Sample workspaces are private and are never published.

## First publication and npm setup

1. Own or join the `@kurdel` npm organization.
2. Create a short-lived granular npm token that can publish public packages in
   the `@kurdel` scope and add it as the `NPM_TOKEN` GitHub Actions secret.
3. Protect the GitHub `npm` environment and require release approval if desired.
4. Run the first release through `.github/workflows/publish.yml`.
5. After the packages exist, configure trusted publishing for every public
   package using repository `ignorantic/kurdel`, workflow `publish.yml`,
   environment `npm`, and the `npm publish` permission.
6. Remove and revoke `NPM_TOKEN` after a trusted publication succeeds.

npm requires a package to exist before trusted publishing can be configured.
Subsequent releases use GitHub's OpenID Connect identity and do not require a
long-lived write token.

## Prepare a prerelease

1. Update `lerna.json`, every public package version, and exact internal package
   ranges to the same prerelease version.
2. Keep `publishConfig.tag` set to `beta` for prereleases.
3. Update `CHANGELOG.md` and its comparison links.
4. Install and verify from a clean checkout:

   ```bash
   npm ci
   npm run release:check
   ```

5. Commit the release preparation and ensure CI passes on every supported Node.js version.

## Publish

1. Create an annotated tag matching the Lerna version, for example:

   ```bash
   git tag -a v0.1.0-beta.1 -m "v0.1.0-beta.1"
   git push origin main --follow-tags
   ```

2. Create a GitHub release from that tag.
3. Publishing starts only after the GitHub release is published. The workflow
   rejects a tag that does not exactly match `lerna.json` and publishes only
   versions that are not already present in npm. Packages are published in
   dependency order, so rerunning a partially completed release is safe.
4. Verify the dist-tag and package metadata:

   ```bash
   npm view @kurdel/core@beta version
   npm view @kurdel/facade dist-tags
   ```

If publishing fails after some packages are uploaded, do not reuse or unpublish
their versions. Fix the problem, increment the prerelease number across the
workspace, and publish the next beta.
