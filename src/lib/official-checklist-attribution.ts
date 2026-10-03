// Erratum for immutable v1 publications created before the page reference was corrected.
export function getOfficialChecklistDescription(
  id: string,
  description: string | null,
): string | null {
  if (
    id === "a0180000-0000-4000-8000-000000000001" &&
    description?.includes("páginas impressas 73–74")
  ) {
    return `${description}\n\nCorreção bibliográfica: o bloco de escavações utiliza as páginas impressas 72–74 de Murbach (2019), incluindo a página 72. A publicação original permanece preservada.`;
  }
  return description;
}
