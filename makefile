release:
	npm version patch
	npm run build
	npm publish

.PHONY: release