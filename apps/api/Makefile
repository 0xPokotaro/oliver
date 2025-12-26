.PHONY: test-serial test build clean build-lambda

test-serial:
	unset CC && cargo test -- --test-threads=1

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
	@if ! command -v zig >/dev/null 2>&1; then \
		echo "Zig is not installed. Please install Zig:"; \
		echo "  brew install zig"; \
		echo "  or download from https://ziglang.org/download/"; \
		exit 1; \
	fi
	@echo "Building Lambda function with cargo-lambda..."
	@which clang > /dev/null 2>&1 || (echo "clang is required but not found" && exit 1)
	@mkdir -p .zig-cache && \
	CC_WRAPPER=$$(mktemp /tmp/cc-wrapper.XXXXXX) && \
		echo '#!/bin/sh' > $$CC_WRAPPER && \
		echo 'exec clang -m64 -O2 -fPIC "$$@"' >> $$CC_WRAPPER && \
		chmod +x $$CC_WRAPPER && \
		ZIG_GLOBAL_CACHE_DIR=$$(pwd)/.zig-cache \
		CC_x86_64_apple_darwin=$$CC_WRAPPER \
		CFLAGS_x86_64_apple_darwin="" \
		env -u MACOSX_DEPLOYMENT_TARGET \
		CRATE_CC_NO_DEFAULTS=1 \
		cargo lambda build --release --bin bootstrap; \
		EXIT_CODE=$$?; \
		rm -f $$CC_WRAPPER; \
		exit $$EXIT_CODE
	@mkdir -p target/lambda/bootstrap
	@if [ -f "target/lambda/bootstrap/bootstrap" ]; then \
		cd target/lambda/bootstrap && zip -r ../bootstrap.zip bootstrap && echo "Lambda binary built at target/lambda/bootstrap.zip"; \
	elif [ -f "target/lambda/bootstrap.zip" ]; then \
		echo "Lambda binary already exists at target/lambda/bootstrap.zip"; \
	else \
		echo "Warning: cargo-lambda may have created the binary in a different location."; \
		echo "Checking target/lambda directory:"; \
		find target/lambda -type f 2>/dev/null | head -10 || echo "No files found in target/lambda"; \
		echo "Creating zip from target/release/bootstrap if available..."; \
		if [ -f "target/release/bootstrap" ]; then \
			cp target/release/bootstrap target/lambda/bootstrap/bootstrap && \
			cd target/lambda/bootstrap && zip -r ../bootstrap.zip bootstrap && \
			echo "Lambda binary built at target/lambda/bootstrap.zip"; \
		else \
			echo "Error: Lambda binary not found."; \
			exit 1; \
		fi; \
	fi

# Lambda用のビルド（手動、cargo-lambdaが使えない場合）
build-lambda-manual:
	@mkdir -p target/lambda/bootstrap
	cargo build --release --bin bootstrap --target x86_64-unknown-linux-musl
	@cp target/x86_64-unknown-linux-musl/release/bootstrap target/lambda/bootstrap/bootstrap || \
		cp target/release/bootstrap target/lambda/bootstrap/bootstrap
	@cd target/lambda && zip -r bootstrap.zip bootstrap
	@echo "Lambda binary built at target/lambda/bootstrap.zip"
