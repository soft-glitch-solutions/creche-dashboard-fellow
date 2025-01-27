export const getStatusBadgeVariant = (status: string) => {
  switch (status.toLowerCase()) {
    case 'administrator':
      return 'destructive';
    case 'developer':
      return 'default';
    case 'manager':
      return 'secondary';
    default:
      return 'outline';
  }
};