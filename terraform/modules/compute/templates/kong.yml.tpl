_format_version: "3.0"

consumers:
  - username: auth0-consumer
    jwt_secrets:
      - algorithm: RS256
        key: https://dev-bd8co7uzp2no173l.us.auth0.com/
        secret: "placeholder"
        rsa_public_key: |
          -----BEGIN PUBLIC KEY-----
          MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAqfK3KJWZspAAPrjiy+DB
          1ou1pt2F4s4h3AbnCD4tL0BUOhAAHtZefWcYlqDi5nej+ufaMSuGVBeRIvhKZb8L
          k9S6CkoMCAEqPDWiU5sArbQjNj9lemJQTa0YrIGYsklEZHBOVr30Wi0XvfYJv4QU
          V6VycsjIfPhYztb9B8Wy3aoCIMjiOzNxLBlLwi//oabieunYTlEJvXiWhSxuAGeX
          sYQR4aEk4EYCycmOOOJSDbVSg8Vhekc8dJLB9ZEHPVs/7DZUMfSBdfTLs1yJd30P
          jMsOQR69yTBtH/w7ahwm09495js7AlH2pKXwJJd3QzHVBok4geQbx2XOPz87xW8Q
          RQIDAQAB
          -----END PUBLIC KEY-----

services:
  - name: backend-api
    # Sidecar pattern: Kong y Backend comparten network namespace en ECS Fargate
    url: http://localhost:8080
    plugins:
      - name: jwt
        config:
          key_claim_name: iss
          claims_to_verify:
            - exp
          uri_param_names: []
      - name: rate-limiting
        config:
          minute: 50
          policy: local
      - name: cors
        config:
          origins:
            - "*"
          methods:
            - GET
            - POST
            - PUT
            - DELETE
            - PATCH
            - OPTIONS
          headers:
            - Accept
            - Content-Type
            - Authorization
          exposed_headers:
            - X-Kong-Proxy-Latency
          max_age: 3600
          credentials: false
    routes:
      - name: api-protegidas
        paths:
          - /api
        strip_path: true
