# CloudCollab IDE

**CloudCollab IDE** is a powerful, browser-based development platform designed for seamless coding, collaboration, and one-click deployment. It integrates secure authentication, real-time collaboration, automated sandboxing, and AI-powered coding assistance—all in a Docker-based environment with a rich user interface.

---

## 🚀 Features

- **Secure Authentication** via [Clerk.dev](https://clerk.dev) (Email/Password & OAuth: Google, GitHub)
- **Multi-language Support**: Node.js, React.js, Next.js, Python (Streamlit), PHP
- **Pre-built Boilerplates** to accelerate project setup
- **Docker-based Sandboxing** for isolated, secure code execution
- **Real-Time Collaboration** powered by [Liveblocks](https://liveblocks.io)
- **Persistent File Storage** with [Cloudflare R2](https://www.cloudflare.com/products/r2/)
- **In-Browser Code Editor** (Monaco), Terminal (Xterm.js), and Live Preview
- **One-Click Deployment** to custom subdomains using [Dokku](https://dokku.com)
- **AI-Powered Chat Assistant** for Premium users (via OpenAI)
- **Structured Data Storage** using PostgreSQL (hosted on [Neon.tech](https://neon.tech))
- **Real-Time Socket Communication** via Socket.IO

---

## 🧱 System Architecture

### 1. **Sandbox Environment**
- Powered by [E2B Sandbox](https://e2b.dev)
- Ephemeral, secure VMs instantiated on project run
- Pre-configured with required dependencies
- Auto-terminated to preserve resources

### 2. **Persistent File Storage**
- Files stored on **Cloudflare R2**
- Backend built with **Cloudflare Workers**
- Handles all CRUD operations on files
- Secure, scalable, and cost-effective storage

### 3. **Code Editor Interface**
- Built with **Monaco Editor**
- File manager for organizing project structure
- Integrated terminal via **Xterm.js**
- Real-time project preview pane

### 4. **Live Collaboration**
- Uses **Liveblocks** + **Yjs CRDT**
- Features: shared editing, presence indicators, inline comments
- Handles conflict resolution in real-time
- Powered by React hooks & Liveblocks APIs

### 5. **One-Click Deployment**
- Powered by **Dokku** (self-hosted on AWS EC2 with SSL via Let's Encrypt)
- Language auto-detection via **Buildpacks**
- Custom subdomains (e.g., `project123.sumayabee.me`)
- NGINX reverse proxy for routing
- Git-push-based deployment model

### 6. **Database Integration**
- **PostgreSQL** hosted on **Neon**
- Schema managed via **Drizzle ORM**
- Handles:
  - User profiles
  - Project metadata
  - Collaboration sessions
  - Sandbox configurations

### 7. **Real-Time Communication**
- **Socket.IO** for client-server event synchronization
- Updates on:
  - Deployment status
  - Terminal outputs
  - Collaborative changes

### 8. **AI Assistant (Premium)**
- Enabled via **SSLCOMMERZ** payment gateway
- AI chatbot powered by a Language Model API (e.g., OpenAI)
- Context-aware responses from active file
- Available only to Premium Developers

---

## 💻 Tech Stack

| Layer         | Technology                               |
|---------------|------------------------------------------|
| Frontend      | React.js, Monaco Editor, Xterm.js        |
| Backend       | Cloudflare Workers, Node.js              |
| Real-Time     | Socket.IO, Liveblocks, Yjs               |
| Storage       | Cloudflare R2                            |
| Deployment    | Dokku on AWS EC2                         |
| Database      | PostgreSQL (Neon), Drizzle ORM           |
| Sandboxing    | E2B Sandbox                              |
| AI Assistant  | OpenAI API                               |
| Authentication| Clerk.dev                                |



---

## Running Locally

### 0. Requirements

The application uses NodeJS for the backend, NextJS for the frontend, and Cloudflare workers for additional backend tasks.

Needed accounts to set up:

- [Clerk](https://clerk.com/): Used for user authentication.
- [E2B](https://e2b.dev/): Used for the terminals and live preview.
- [Anthropic](https://anthropic.com/) or AWS Bedrock: API keys for code generation.
- [OpenAI](https://openai.com/): API keys for applying AI-generated code diffs.

A quick overview of the tech before we start: The deployment uses a **NextJS** app for the frontend and an **ExpressJS** server on the backend. Presumably that's because NextJS integrates well with Clerk middleware but not with Socket.io.

### 1. Initial setup

No surprise in the first step:

```bash
git clone https://github.com/arafatDU/cloudcollab-ide.git
cd cloudcollab-ide
```

Run `npm install` in:

```
/frontend
/backend/server
```

### 2. Adding Clerk

Setup the Clerk account.
Get the API keys from Clerk.

Update `/frontend/.env`:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY='🔑'
CLERK_SECRET_KEY='🔑'
```

Then, update `backend/server/.env`:

```
CLERK_SECRET_KEY='🔑'
```

### 4. Deploying the database

Create a database:

```
psql postgres -c "CREATE DATABASE cloudcollab;"
```

Update `backend/server/.env` with the database connection string.

```
DATABASE_URL=postgresql://localhost:5432/cloudcollab
```

Follow this [guide](https://docs.google.com/document/d/1w5dA5daic_sIYB5Seni1KvnFx51pPV2so6lLdN2xa7Q/edit?usp=sharing) for more info.

### 5. Applying the database schema

Delete the `/backend/server/drizzle/meta` directory.

In the `/backend/server/` directory:

```
npm run generate
npm run migrate
```

### 6. Adding E2B

Setup the E2B account.

Update `/backend/server/.env`:

```
E2B_API_KEY='🔑'
```

### 7. Configuring the frontend

Update `/frontend/.env`:

```
NEXT_PUBLIC_SERVER_URL='http://localhost:4000'
```

Then add EITHER Anthropic direct API key:

```
ANTHROPIC_API_KEY='🔑'
```

OR AWS Bedrock configuration (if using Claude through AWS as described in the [Setting Up Your AWS Bedrock Keys](#setting-up-your-aws-bedrock-keys) section):

```
AWS_ACCESS_KEY_ID='🔑'
AWS_SECRET_ACCESS_KEY='🔑'
AWS_REGION='your_aws_region'
AWS_ARN='arn:aws:bedrock:...'
```

Finally, add OpenAI API key for code diffs:

```
OPENAI_API_KEY='🔑'
```

### 8. Running the IDE

Run `npm run dev` simultaneously in:

```
/frontend
/backend/server
```
