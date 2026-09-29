export const samplePostmanCollection = {
  info: {
    _postman_id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    name: "Acme Payments & Commerce API",
    description: "Production REST API for customer management, tokenized payments, subscriptions, and transaction webhooks.",
    schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
    version: "1.4.0"
  },
  variable: [
    {
      key: "baseUrl",
      value: "https://api.acmepay.io/v1",
      type: "string",
      description: "Base URL for the Acme Payment API"
    },
    {
      key: "apiVersion",
      value: "v1",
      type: "string",
      description: "Current API version"
    }
  ],
  auth: {
    type: "bearer",
    bearer: [
      {
        key: "token",
        value: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
        type: "string"
      }
    ]
  },
  item: [
    {
      name: "Authentication",
      description: "Endpoints to issue, refresh, and revoke bearer authentication tokens.",
      item: [
        {
          name: "User Login",
          request: {
            method: "POST",
            header: [
              { key: "Content-Type", value: "application/json" },
              { key: "Accept", value: "application/json" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                email: "developer@acmepay.io",
                password: "SuperSecretPassword123!",
                client_id: "client_994827101",
                client_secret: "sec_9918239018239102"
              }, null, 2),
              options: { raw: { language: "json" } }
            },
            url: {
              raw: "{{baseUrl}}/auth/login",
              host: ["{{baseUrl}}"],
              path: ["auth", "login"]
            },
            description: "Authenticates an API client or user and returns a signed JWT access token and refresh token."
          },
          response: [
            {
              name: "200 Success - Tokens Issued",
              code: 200,
              status: "OK",
              header: [{ key: "Content-Type", value: "application/json" }],
              body: JSON.stringify({
                access_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.sample_token_payload_acme.signature",
                token_type: "Bearer",
                expires_in: 3600,
                refresh_token: "ref_8829102948102830"
              }, null, 2)
            },
            {
              name: "401 Unauthorized - Invalid Credentials",
              code: 401,
              status: "Unauthorized",
              header: [{ key: "Content-Type", value: "application/json" }],
              body: JSON.stringify({
                error: "invalid_credentials",
                message: "The provided email or password does not match our records."
              }, null, 2)
            }
          ]
        },
        {
          name: "Refresh Token",
          request: {
            method: "POST",
            header: [
              { key: "Content-Type", value: "application/json" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                refresh_token: "ref_8829102948102830"
              }, null, 2),
              options: { raw: { language: "json" } }
            },
            url: {
              raw: "{{baseUrl}}/auth/refresh",
              host: ["{{baseUrl}}"],
              path: ["auth", "refresh"]
            },
            description: "Rotates an expired access token using a valid refresh token."
          },
          response: [
            {
              name: "200 Success - Refreshed",
              code: 200,
              status: "OK",
              header: [{ key: "Content-Type", value: "application/json" }],
              body: JSON.stringify({
                access_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.new_token_payload.signature",
                token_type: "Bearer",
                expires_in: 3600
              }, null, 2)
            }
          ]
        }
      ]
    },
    {
      name: "Users",
      description: "Manage customer profiles, billing addresses, and access roles.",
      item: [
        {
          name: "Create User",
          request: {
            method: "POST",
            header: [
              { key: "Content-Type", value: "application/json" },
              { key: "Idempotency-Key", value: "idem_91823901" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                name: "Sarah Connor",
                email: "sarah.connor@sky.net",
                role: "admin",
                billing_address: {
                  line1: "742 Evergreen Terrace",
                  city: "Springfield",
                  country: "US",
                  postal_code: "97477"
                }
              }, null, 2),
              options: { raw: { language: "json" } }
            },
            url: {
              raw: "{{baseUrl}}/users",
              host: ["{{baseUrl}}"],
              path: ["users"]
            },
            description: "Creates a new customer user profile with associated billing information."
          },
          response: [
            {
              name: "201 Created",
              code: 201,
              status: "Created",
              header: [{ key: "Content-Type", value: "application/json" }],
              body: JSON.stringify({
                id: "usr_99182391",
                name: "Sarah Connor",
                email: "sarah.connor@sky.net",
                role: "admin",
                created_at: "2026-09-23T10:00:00Z"
              }, null, 2)
            },
            {
              name: "400 Validation Error",
              code: 400,
              status: "Bad Request",
              header: [{ key: "Content-Type", value: "application/json" }],
              body: JSON.stringify({
                error: "validation_error",
                message: "Email address already registered."
              }, null, 2)
            }
          ]
        },
        {
          name: "Get User by ID",
          request: {
            method: "GET",
            header: [
              { key: "Accept", value: "application/json" }
            ],
            url: {
              raw: "{{baseUrl}}/users/:userId",
              host: ["{{baseUrl}}"],
              path: ["users", ":userId"],
              variable: [
                {
                  key: "userId",
                  value: "usr_99182391",
                  description: "Unique alphanumeric identifier of the user"
                }
              ]
            },
            description: "Retrieves complete account details for a specific user ID."
          },
          response: [
            {
              name: "200 Success",
              code: 200,
              status: "OK",
              header: [{ key: "Content-Type", value: "application/json" }],
              body: JSON.stringify({
                id: "usr_99182391",
                name: "Sarah Connor",
                email: "sarah.connor@sky.net",
                status: "active",
                balance_usd: 450.00
              }, null, 2)
            },
            {
              name: "404 User Not Found",
              code: 404,
              status: "Not Found",
              header: [{ key: "Content-Type", value: "application/json" }],
              body: JSON.stringify({
                error: "not_found",
                message: "No user found with the provided identifier."
              }, null, 2)
            }
          ]
        },
        {
          name: "Update User",
          request: {
            method: "PUT",
            header: [
              { key: "Content-Type", value: "application/json" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                name: "Sarah J. Connor",
                phone: "+1 555 019 2831"
              }, null, 2),
              options: { raw: { language: "json" } }
            },
            url: {
              raw: "{{baseUrl}}/users/:userId",
              host: ["{{baseUrl}}"],
              path: ["users", ":userId"],
              variable: [
                { key: "userId", value: "usr_99182391", description: "Target user ID" }
              ]
            },
            description: "Updates profile fields for an existing user account."
          },
          response: [
            {
              name: "200 Success - Updated",
              code: 200,
              status: "OK",
              header: [{ key: "Content-Type", value: "application/json" }],
              body: JSON.stringify({
                id: "usr_99182391",
                name: "Sarah J. Connor",
                updated_at: "2026-09-23T10:15:00Z"
              }, null, 2)
            }
          ]
        },
        {
          name: "Delete User",
          request: {
            method: "DELETE",
            header: [],
            url: {
              raw: "{{baseUrl}}/users/:userId",
              host: ["{{baseUrl}}"],
              path: ["users", ":userId"],
              variable: [
                { key: "userId", value: "usr_99182391", description: "User ID to permanently remove" }
              ]
            },
            description: "Soft-deletes or archives a user account and invalidates active session tokens."
          },
          response: [
            {
              name: "200 User Deleted",
              code: 200,
              status: "OK",
              header: [{ key: "Content-Type", value: "application/json" }],
              body: JSON.stringify({ success: true, message: "User marked as deleted." }, null, 2)
            }
          ]
        }
      ]
    },
    {
      name: "Payments",
      description: "Initiate credit card charges, authorize transactions, and inspect payment status.",
      item: [
        {
          name: "Create Payment",
          request: {
            method: "POST",
            header: [
              { key: "Content-Type", value: "application/json" },
              { key: "X-Api-Key", value: "sk_live_51M0abcdef1234567890" }
            ],
            body: {
              mode: "raw",
              raw: JSON.stringify({
                amount: 15000,
                currency: "USD",
                customer_id: "usr_99182391",
                payment_method: "pm_card_visa",
                description: "Invoice #10492 - Annual Enterprise Subscription"
              }, null, 2),
              options: { raw: { language: "json" } }
            },
            url: {
              raw: "{{baseUrl}}/payments",
              host: ["{{baseUrl}}"],
              path: ["payments"]
            },
            description: "Charges a specified amount in cents against a customer's registered payment method."
          },
          response: [
            {
              name: "200 Payment Captured",
              code: 200,
              status: "OK",
              header: [{ key: "Content-Type", value: "application/json" }],
              body: JSON.stringify({
                payment_id: "pay_918239102",
                status: "succeeded",
                amount: 15000,
                currency: "USD",
                customer_id: "usr_99182391",
                receipt_url: "https://acmepay.io/receipts/pay_918239102.pdf"
              }, null, 2)
            },
            {
              name: "402 Payment Required - Card Declined",
              code: 402,
              status: "Payment Required",
              header: [{ key: "Content-Type", value: "application/json" }],
              body: JSON.stringify({
                error: "card_declined",
                message: "Your card was declined due to insufficient funds."
              }, null, 2)
            }
          ]
        },
        {
          name: "Get Payment Status",
          request: {
            method: "GET",
            header: [
              { key: "Accept", value: "application/json" }
            ],
            url: {
              raw: "{{baseUrl}}/payments/:paymentId?include_receipt=true",
              host: ["{{baseUrl}}"],
              path: ["payments", ":paymentId"],
              query: [
                {
                  key: "include_receipt",
                  value: "true",
                  description: "Whether to return the formatted receipt download URL"
                }
              ],
              variable: [
                {
                  key: "paymentId",
                  value: "pay_918239102",
                  description: "Unique payment transaction ID"
                }
              ]
            },
            description: "Fetches live transaction status, authorization codes, and settled amounts."
          },
          response: [
            {
              name: "200 Success",
              code: 200,
              status: "OK",
              header: [{ key: "Content-Type", value: "application/json" }],
              body: JSON.stringify({
                payment_id: "pay_918239102",
                status: "succeeded",
                amount: 15000,
                currency: "USD"
              }, null, 2)
            }
          ]
        }
      ]
    }
  ]
};

