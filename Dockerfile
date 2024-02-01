FROM node:21-bookworm
LABEL org.label-schema.name="Reflective Mentor LTI 1.3 endpoint"
WORKDIR /usr/app
COPY ./app /usr/app
COPY ./.env /usr/app

ARG PORT=80
ENV PORT=${PORT}

EXPOSE $PORT

RUN npm install

ENTRYPOINT ["node", "app.js"]
CMD tail -f /dev/null
