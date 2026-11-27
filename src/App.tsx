import PlatformPage from "./platform/PlatformPage";

/**
 * Route boundary.
 *
 * This workspace contains only the /platform showcase. In the full Campus+
 * repository, mount <PlatformPage /> at "/platform" alongside the existing
 * routes ("/", "/login", "/home", "/timetable") without touching their auth
 * guards. The page is public and needs no session.
 *
 * Here the showcase renders for every path so the built index.html previews it.
 */
export default function App() {
  return <PlatformPage />;
}
