import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  //   route("/image-editor", "routes/image-editor.tsx"),
  route("/image-editor", "routes/select-area.tsx"),
  route("/image-editor", "routes/select-area-linear-versioning.tsx"),
  route("/api/edit", "routes/api.edit.tsx"),
  route("/nano", "routes/nano-image-editor.tsx"),
  route("/test", "routes/test.tsx"),
] satisfies RouteConfig;
