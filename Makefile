help: ## Prints help for targets with comments
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

build: ## Builds docker stack
	docker compose -f docker-compose.yml build

up: ## Brings docker stack up
	mkdir -p node_modules
	docker compose -f docker-compose.yml up -d -V --force-recreate

down: ## Brings docker stack down
	docker compose -f docker-compose.yml down --remove-orphans

build-production: ## Builds production docker stack
	docker compose -f docker-compose.production.yml build

up-production: ## Brings production docker stack up
	docker compose -f docker-compose.production.yml up -d

down-production: ## Brings production docker stack down
	docker compose -f docker-compose.production.yml down