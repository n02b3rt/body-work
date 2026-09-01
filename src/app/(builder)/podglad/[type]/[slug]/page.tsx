import { notFound } from "next/navigation";
import {
  isBuilderTypeSegment,
  requireBuilderUser,
  resolveBuilderDocument,
} from "@/lib/builder/document";
import { coerceBuilderDoc } from "@/lib/builder/types";

type PreviewPageProps = {
  params: Promise<{ type: string; slug: string }>;
};

/**
 * What the editor's iframe points at: the live-preview surface for a document
 * being edited, separate from `/edytor` itself so the frame can reload its
 * content without reloading the whole editor shell around it.
 *
 * Same auth gate as `/edytor`: this is not a public route, and rendering
 * unsaved draft content (`draft: true` in `resolveBuilderDocument`) makes that
 * doubly true. `src/components/builder/render/` (Phase 1B) replaces the walk
 * below with the real shared renderer.
 */
export default async function PreviewPage({ params }: PreviewPageProps) {
  const { type, slug } = await params;
  if (!isBuilderTypeSegment(type)) notFound();

  const user = await requireBuilderUser();
  if (!user) notFound();

  const result = await resolveBuilderDocument(type, slug);
  if (!result) notFound();

  const builder = "builder" in result.doc ? result.doc.builder : null;
  const doc = coerceBuilderDoc(builder);
  const rootChildren = doc.nodes[doc.root]?.children ?? [];

  return (
    <div className="min-h-full p-8">
      {rootChildren.length === 0 ? (
        <p className="text-muted">Ta strona nie ma jeszcze żadnych elementów.</p>
      ) : (
        <ul className="space-y-2">
          {rootChildren.map((id) => (
            <li key={id} className="rounded-md border border-line bg-page p-4">
              {doc.nodes[id]?.type ?? id}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
