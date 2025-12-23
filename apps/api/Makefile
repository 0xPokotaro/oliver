.PHONY: test-serial test build clean build-lambda

test-serial:
	cargo test -- --test-threads=1

test:
	cargo test

build:
	cargo build

clean:
	cargo clean

# Lambda用のビルド（cargo-lambdaを使用）
build-lambda:
	@if ! command -v cargo-lambda >/dev/null 2>&1; then \
		echo "cargo-lambda is not installed. Installing..."; \
		cargo install cargo-lambda; \
	fi
	cargo lambda build --release --bin bootstrap
	@mkdir -p target/lambda
	@if [ -d "target/lambda/bootstrap" ]; then \
		cd target/lambda/bootstrap && zip -r ../bootstrap.zip bootstrap; \
	elif [ -f "target/lambda/bootstrap/bootstrap" ]; then \
		cd target/lambda/bootstrap && zip -r ../bootstrap.zip bootstrap; \
	else \
		echo "Error: Lambda binary not found. Expected at target/lambda/bootstrap/bootstrap"; \
		exit 1; \
	fi
	@echo "Lambda binary built at target/lambda/bootstrap.zip"

# Lambda用のビルド（手動、cargo-lambdaが使えない場合）
build-lambda-manual:
	@mkdir -p target/lambda/bootstrap
	cargo build --release --bin bootstrap --target x86_64-unknown-linux-musl
	@cp target/x86_64-unknown-linux-musl/release/bootstrap target/lambda/bootstrap/bootstrap || \
		cp target/release/bootstrap target/lambda/bootstrap/bootstrap
	@cd target/lambda && zip -r bootstrap.zip bootstrap
	@echo "Lambda binary built at target/lambda/bootstrap.zip"
