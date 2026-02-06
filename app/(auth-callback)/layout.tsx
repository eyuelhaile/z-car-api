// Simple pass-through layout for auth callback routes
// This bypasses the auth layout while still inheriting from root layout
export default function AuthCallbackLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

