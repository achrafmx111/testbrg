import { Navigate } from 'react-router-dom';

// Redirect about sub-pages to their canonical root pages
export const SkillCoreRedirect = () => <Navigate to="/skillcore" replace />;
export const DiscoveryRedirect = () => <Navigate to="/discovery" replace />;
export const TalentFlowRedirect = () => <Navigate to="/talentflow" replace />;
