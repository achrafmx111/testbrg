import { Navigate } from 'react-router-dom';

// Redirect programme routes to skillcore or specific course pages
export const ProgrammeS4Hana = () => <Navigate to="/courses/sap-s4hana" replace />;
export const ProgrammeSapBtp = () => <Navigate to="/courses/sap-btp" replace />;
export const ProgrammeBw4Hana = () => <Navigate to="/courses/bw4hana-datasphere" replace />;
export const ProgrammeSacAnalytics = () => <Navigate to="/courses/sac-analytics" replace />;
export const ProgrammeSuccessFactors = () => <Navigate to="/courses/successfactors" replace />;
export const ProgrammeAbapFiori = () => <Navigate to="/courses/abap-fiori" replace />;
