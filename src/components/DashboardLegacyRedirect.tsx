import { Navigate, useLocation, useParams } from "react-router-dom";

const roleBasePath: Record<string, string> = {
  admin: "/admin",
  talent: "/talent",
  company: "/company",
};

const roleSegmentAlias: Record<string, Record<string, string>> = {
  talent: {
    settings: "profile",
  },
  company: {
    applications: "applicants",
    settings: "profile",
  },
};

export default function DashboardLegacyRedirect() {
  const location = useLocation();
  const params = useParams();

  const role = (params.role ?? "").toLowerCase();
  const basePath = roleBasePath[role];

  if (!basePath) {
    return <Navigate to="/dashboard" replace />;
  }

  const wildcard = (params["*"] ?? "").replace(/^\/+/, "");
  const segments = wildcard ? wildcard.split("/") : [];

  if (segments.length > 0) {
    const [first, ...rest] = segments;
    const remapped = roleSegmentAlias[role]?.[first] ?? first;
    const nextSegments = [remapped, ...rest].filter(Boolean);
    const nextPath = `${basePath}/${nextSegments.join("/")}`;
    return <Navigate to={`${nextPath}${location.search}${location.hash}`} replace />;
  }

  return <Navigate to={`${basePath}${location.search}${location.hash}`} replace />;
}
