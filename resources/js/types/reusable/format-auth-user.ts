// Adapter to transform raw Laravel auth into your strict AuthUser interface
export const formatAuthUser = (rawAuth: any) => {
    if (!rawAuth?.user) return null;
    const u = rawAuth.user;
    return {
        user: u,
        role: u.roles?.[0] || 'guest',
        displayName: u.name || `${u.first_name} ${u.last_name}`.trim(),
        email: u.email,
        initials:
            `${u.first_name?.[0] || ''}${u.last_name?.[0] || ''}`.toUpperCase(),
    };
};
