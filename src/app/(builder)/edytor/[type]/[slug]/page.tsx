import { notFound } from "next/navigation";
import { BuilderShell } from "@/components/builder/editor/BuilderShell";
import {
  BUILDER_TYPES,
  isBuilderTypeSegment,
  requireBuilderUser,
  resolveBuilderDocument,
} from "@/lib/builder/document";
import { coerceBuilderDoc } from "@/lib/builder/types";

type EditorPageProps = {
  params: Promise<{ type: string; slug: string }>;
};

/** `Page`/`Post` carry `title`; `SiteComponent` carries `name`. */
function titleOf(doc: { title?: string | null } | { name?: string | null }): string {
  if ("title" in doc && doc.title) return doc.title;
  if ("name" in doc && doc.name) return doc.name;
  return "(bez nazwy)";
}

/**
 * The full-screen editor shell: `dash.localhost/edytor/{type}/{slug}`.
 *
 * Staff-only, same gate as `/admin` (`src/proxy.ts` keeps this off public
 * hosts entirely). Everything interactive lives in `BuilderShell` (a client
 * component); this server component's only jobs are the auth gate, the
 * document lookup, and handing over the saved tree as the client store's
 * starting point.
 */
export default async function EditorPage({ params }: EditorPageProps) {
  const { type, slug } = await params;
  if (!isBuilderTypeSegment(type)) notFound();

  const user = await requireBuilderUser();
  if (!user) notFound();

  const result = await resolveBuilderDocument(type, slug);
  if (!result) notFound();

  const builder = "builder" in result.doc ? result.doc.builder : null;

  return (
    <BuilderShell
      collection={result.collection}
      documentId={Number(result.doc.id)}
      initialDoc={coerceBuilderDoc(builder)}
      title={`${BUILDER_TYPES[type].label}: ${titleOf(result.doc)}`}
    />
  );
}
