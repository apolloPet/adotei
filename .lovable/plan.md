## 1. Diferenciar ícones das abas "Adoções" e "Animais"

Em `src/components/AdminPanel.tsx`, ambas as abas usam o mesmo ícone `PawPrint`. Trocar:
- **Adoções** → `ClipboardList` (representa solicitações/processos de adoção)
- **Animais** → `PawPrint` (mantém, representa o cadastro de animais)

Atualizar o import do `lucide-react` adicionando `ClipboardList`.

## 2. Responsividade da "Análise da Solicitação" (mobile)

Arquivo: `src/components/admin/adoption/AdoptionDetailsPanel.tsx` (renderizado dentro do Dialog em `AdoptionManagement.tsx`, linha 429).

### Ajustes de layout
- Reduzir paddings internos no mobile: `p-4` → `p-3 sm:p-4` nos cards/Sections e no bloco de compatibilidade.
- O grid das 3 fotos do animal (`grid-cols-3` com `h-20`) reduz para `h-16 sm:h-20` para não estourar a largura.
- Nas `Row`, usar `flex-col sm:flex-row` para que rótulo e valor empilhem em telas estreitas, com `text-left` no valor quando empilhado (evita texto cortado em emails/endereços longos).
- Garantir `break-words` / `truncate` adequado em email, endereço e IDs.
- O `DialogContent` (em `AdoptionManagement.tsx`) já é `w-[95vw]`; ajustar `px` interno para `px-3 sm:px-6` para ganhar largura útil.

### Remoção do sistema de pontos
No bloco "Compatibilidade":
- Remover o número grande (`{compat.score}` + "pontos") e a barra `<Progress>`.
- Manter apenas o `Badge` textual: **Alta compatibilidade** (verde #00EA7C), **Média compatibilidade** (âmbar) ou **Baixa compatibilidade** (vermelho). Quando houver bloqueio, manter o badge "Bloqueado".
- Manter as 3 colunas de razões (Match perfeito / Divergência / Bloqueios), mas no mobile virar `grid-cols-1` (já é) e reduzir paddings.
- Remover também a seção "Pontos registrados pela equipe" que usa `matchPoints` numéricos (high/medium/low) OU convertê-la apenas em badges textuais sem número. Para manter informação útil, converter para badges textuais (sem número/score).

### Resultado esperado mobile (390px)
- Dialog sem scroll horizontal.
- Linhas legíveis empilhadas, sem corte de texto.
- Compatibilidade comunicada por cor + texto, sem números/barras.

## Arquivos a editar
- `src/components/AdminPanel.tsx` — troca de ícone da aba Adoções.
- `src/components/admin/adoption/AdoptionDetailsPanel.tsx` — remoção do score numérico/Progress, ajustes responsivos de paddings, grid de fotos e Rows.
- `src/components/admin/adoption/AdoptionManagement.tsx` — pequeno ajuste de padding no `DialogContent` da Análise da Solicitação (se necessário).
