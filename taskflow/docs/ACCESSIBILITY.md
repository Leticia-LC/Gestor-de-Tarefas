# Acessibilidade — Recursos implementados

Este projeto adicionou um conjunto de recursos de acessibilidade (mínimo de 5):

1. VLibras (intérprete em Libras) — plugin oficial carregável via toolbar
2. Tema Alto Contraste — classe `.a11y-high-contrast` aplicada no HTML
3. Texto Maior — classe `.a11y-large-text` aplicada no HTML
4. Fonte/ajustes para dislexia — classe `.a11y-dyslexic` aplicada no HTML
5. Reduzir Movimento — classe `.a11y-reduce-motion` aplicada no HTML

Outros recursos implícitos/úteis:
- Link "Pular para conteúdo" (skip link) no topo para navegação por teclado
- Melhores contornos de foco (`:focus-visible`) para elementos interativos
- Preferências persistidas em `localStorage` para as opções do usuário

Onde encontrar:
- Toolbar de acessibilidade adicionada em `src/components/AccessibilityToolbar.tsx` e incluída em `src/app/layout.tsx`.
- Estilos principais adicionados em `src/app/globals.css` (classes `a11y-*` + `.accessibility-toolbar` / `.skip-link`).
- VLibras é carregado dinamicamente quando ativado pelo usuário (script oficial `https://vlibras.gov.br/app/vlibras-plugin.js`).

Como testar localmente
1. Inicie o servidor de desenvolvimento:

```powershell
cd C:\Users\lelek\Downloads\Gestor-de-Tarefas\taskflow
npm run dev
```

2. Abra o app no navegador e verifique a barra no topo:
- Teste cada toggle e observe a aparência do site (alto contraste, texto maior, fonte disléxica, reduzir movimento).
- Ative VLibras — você verá o widget do intérprete aparecer (pode levar alguns segundos para carregar o script externo).

3. Teste teclado:
- Use `Tab` para navegar até o link "Pular para conteúdo" e pressione Enter para focar o `main`.
- Verifique o destaque do foco (`:focus-visible`) em links/botões.

4. Verificar corrigeido: botão "Editar" desaparecendo no alto contraste

- Vá para várias telas que exibem o botão "Editar" (Dashboard, Lista de tarefas, Calendário, página de edição de tarefas) e ative a opção "Alto contraste" na toolbar.
- Confirme que os botões permanecem visíveis — com fundo amarelo primário e texto preto — e que a borda/foco ficam bem destacados.
- Se algum botão ainda estiver invisível, abrir as Ferramentas de Desenvolvedor (F12) e inspecionar o botão para confirmar que ele tem uma cor de fundo (background-color) e cor de texto (color) aplicadas; procure por regras conflitantes.

Observações / próximos passos recomendados
- Incluir a fonte OpenDyslexic via self-hosting ou CDN se desejar melhor suporte para a opção disléxica.
- Melhorar i18n/labels dos controles para leitores de tela (ex.: aria-live region para notificações quando VLibras carrega).
- Adicionar testes E2E que validem a persistência das preferências de acessibilidade.

Se quiser, eu posso agora:
- Carregar uma fonte disléxica oficial para a option de dyslexic font;
- Melhorar as mensagens ARIA e avisos quando o VLibras estiver carregando/erro;
- Adicionar um painel de configuração acessível com exemplos visuais.

Se quiser, posso executar essas verificações automaticamente (E2E) após você rodar o servidor — diga se quer que eu adicione um pequeno conjunto de Playwright checks que validem alto contraste e leitura dos botões.
