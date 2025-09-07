import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("/nano", "routes/nano-image-editor.tsx"),
] satisfies RouteConfig;
