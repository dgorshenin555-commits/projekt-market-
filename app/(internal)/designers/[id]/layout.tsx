import { MOCK_DESIGNERS } from '@/lib/mock-data';

export function generateStaticParams() {
  return MOCK_DESIGNERS.map((designer) => ({
    id: designer.id,
  }));
}

export default function DesignerProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
