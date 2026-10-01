export default function FlowersLayout({ children }: LayoutProps<"/flowers">) {
  return (
    <div className="flex min-h-full w-full min-w-0 flex-1 flex-col bg-background">
      {children}
    </div>
  );
}
