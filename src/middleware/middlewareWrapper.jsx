import { PermissionProvider } from "./middleware";

export default function middlewareWrapper({ children }) {
    return (
        <PermissionProvider>
            {children}
        </PermissionProvider>
    )
}