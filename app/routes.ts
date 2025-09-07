import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("/image-editor", "routes/image-editor.tsx"),
  route("/api/edit", "routes/api.edit.tsx"),
] satisfies RouteConfig;
