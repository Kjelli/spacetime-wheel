import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { Identity } from "spacetimedb";
import { SpacetimeDBProvider } from "spacetimedb/react";
import { DbConnection, type ErrorContext } from "./module_bindings/index.ts";

const host = import.meta.env.VITE_SPACETIME_MODULE_HOST || "localhost";
const port = import.meta.env.VITE_SPACETIME_MODULE_PORT || 3000;

const onConnect = (conn: DbConnection, identity: Identity, token: string) => {
  localStorage.setItem("auth_token", token);
  console.log(
    "Connected to SpacetimeDB with identity:",
    identity.toHexString()
  );
  conn.reducers.onUpdateUserName(() => console.log("Name set."));
};

const onDisconnect = () => console.log("Disconnected from SpacetimeDB");

const onConnectError = (_ctx: ErrorContext, err: Error) =>
  console.log("Error connecting to SpacetimeDB:", err);

const connectionBuilder = DbConnection.builder()
  .withUri(`ws://${host}:${port}`)
  .withCompression("gzip")
  .withModuleName("spacetime-wheel")
  .withToken(localStorage.getItem("auth_token") || undefined)
  .onConnect(onConnect)
  .onDisconnect(onDisconnect)
  .onConnectError(onConnectError);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SpacetimeDBProvider connectionBuilder={connectionBuilder}>
      <App />
    </SpacetimeDBProvider>
  </StrictMode>
);
