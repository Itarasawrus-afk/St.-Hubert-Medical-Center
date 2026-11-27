# Deployment Assets

This directory contains the static frontend build script and the output location used by the repository's deployment workflow.

- `build.sh` installs the frontend dependencies from `frontend/package-lock.json`, runs the Vite production build, and copies the generated files into `deploy/site/`.
- `site/` is the generated static-site output directory. It is recreated by the build script and should contain only files intended for public static hosting.
- `migrations/`, when present, contains numbered SQL migration and verification pairs consumed by the workflow's migration-validation stage.

The static-site workflow does not deploy the FastAPI backend. See the repository-level [Deployment Overview](../DEPLOYMENT.md) and [Backend Deployment Handoff](../backend/DEPLOYMENT_HANDOFF.md).

Do not place credentials, `.env` files, private patient-level data, database backups, or unapproved exports in the static-site output.
