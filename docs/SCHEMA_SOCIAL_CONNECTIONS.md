# Schema Design: Social Media Connections

This document outlines the proposed database schema for storing user social media connection details, including access and refresh tokens. These tokens must always be encrypted at rest.

## Table/Collection: `SocialConnections`

This table/collection will store a record for each social media account a user connects to SociAI Reels.

| Column Name         | Data Type                      | Nullable | Description                                                                                                | Example                                       |
|---------------------|--------------------------------|----------|------------------------------------------------------------------------------------------------------------|-----------------------------------------------|
| `id`                | UUID / Serial (Primary Key)    | No       | Unique identifier for the connection record.                                                               | `c4a76dea-a9b9-4e6c-8f2e-7d1c5a9e0b3f`      |
| `user_id`           | String / VARCHAR               | No       | Foreign key referencing the user ID (e.g., Clerk User ID). Indexed for quick lookups.                      | `user_2aBcDeFgHiJkLmNoPqRsTuVwXyZ`            |
| `platform`          | VARCHAR(50) / String (Enum)    | No       | Identifier for the social media platform.                                                                  | `youtube`, `tiktok`, `instagram`, `twitter`   |
| `platform_user_id`  | VARCHAR(255) / String          | No       | The user's unique ID on the specific social media platform.                                                | `UCXoB...` (YouTube), `123456789` (TikTok)     |
| `platform_username` | VARCHAR(255) / String          | Yes      | The user's username or handle on the platform (for display purposes).                                      | `@SociAIReelsUser`                            |
| `access_token`      | TEXT / String                  | No       | The OAuth access token. **MUST be encrypted at rest.**                                                     | `ENCRYPTED[...]`                              |
| `refresh_token`     | TEXT / String                  | Yes      | The OAuth refresh token, if provided by the platform. **MUST be encrypted at rest.**                       | `ENCRYPTED[...]`                              |
| `scopes`            | TEXT / String / ARRAY of Strings | Yes      | Comma-separated string or array of OAuth scopes granted by the user.                                       | `youtube.upload,profile.read`                 |
| `token_type`        | VARCHAR(50) / String           | Yes      | Type of the token, e.g., "Bearer".                                                                         | `Bearer`                                      |
| `expires_at`        | TIMESTAMP / DateTime           | Yes      | Timestamp indicating when the `access_token` expires, if applicable.                                     | `2024-12-31T23:59:59Z`                        |
| `connection_status` | VARCHAR(50) / String (Enum)    | No       | Current status of the connection.                                                                          | `active`, `revoked`, `expired`, `error`       |
| `last_validated_at` | TIMESTAMP / DateTime           | Yes      | Timestamp of the last successful validation or use of the token.                                           | `2024-07-15T10:00:00Z`                        |
| `created_at`        | TIMESTAMP / DateTime           | No       | Timestamp of when the record was created. Automatically set.                                               | `2024-07-15T09:00:00Z`                        |
| `updated_at`        | TIMESTAMP / DateTime           | No       | Timestamp of when the record was last updated. Automatically set.                                          | `2024-07-15T09:30:00Z`                        |

**Notes:**

-   **Encryption**: `access_token` and `refresh_token` are highly sensitive and **must** be encrypted at rest using a strong encryption algorithm and a securely managed encryption key (e.g., using a Key Management Service or environment variables for the key, ensuring the key itself is not committed to version control).
-   **Indexing**: Key columns like `user_id`, `platform`, and `platform_user_id` should be indexed for efficient querying.
-   **Composite Keys**: A unique composite key on (`user_id`, `platform`, `platform_user_id`) could be considered to prevent duplicate connections for the same user to the same platform account, though a unique `platform_user_id` per platform might also suffice if a user can only connect one account of a given platform type.
-   **Enum Types**: Fields like `platform` and `connection_status` are good candidates for Enum types if your database supports them, for data integrity.
-   **Scalability**: For a large number of users and connections, consider the database's ability to handle many encrypted/decrypted operations if tokens are frequently accessed.

This schema provides a solid foundation for managing social media connections. The exact data types might vary slightly based on the chosen database system (e.g., PostgreSQL, MySQL, MongoDB). 