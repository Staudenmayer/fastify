# Start from Ubuntu
FROM ubuntu:22.04 AS base

# Install curl and git
RUN apt-get update && \
    apt-get install -y curl git unzip

# Install Bun
RUN curl -fsSL https://bun.sh/install | bash
