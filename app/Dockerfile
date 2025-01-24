FROM node:latest

RUN mkdir -p /app && chown -R node:node /app
USER node
WORKDIR /app

RUN mkdir -p ~/.npm-global && \
    npm config set prefix '~/.npm-global'

ENV PATH=/home/node/.npm-global/bin:$PATH
ENV EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0

COPY --chown=node:node run.sh .
CMD ["bash", "run.sh"]