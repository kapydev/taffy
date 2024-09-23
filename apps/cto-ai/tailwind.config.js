const { createGlobPatternsForDependencies } = require('@nx/react/tailwind');
const { join } = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    join(
      __dirname,
      '{src,pages,components,app}/**/*!(*.stories|*.spec).{ts,tsx,html}'
    ),
    ...createGlobPatternsForDependencies(__dirname),
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--vscode-input-background)',
        //Default VSC colors
        'vsc-foreground': 'var(--vscode-foreground)',
        'vsc-disabledForeground': 'var(--vscode-disabledForeground)',
        'vsc-errorForeground': 'var(--vscode-errorForeground)',
        'vsc-descriptionForeground': 'var(--vscode-descriptionForeground)',
        'vsc-icon-foreground': 'var(--vscode-icon-foreground)',
        'vsc-focusBorder': 'var(--vscode-focusBorder)',
        'vsc-textLink-foreground': 'var(--vscode-textLink-foreground)',
        'vsc-textLink-activeForeground':
          'var(--vscode-textLink-activeForeground)',
        'vsc-textSeparator-foreground':
          'var(--vscode-textSeparator-foreground)',
        'vsc-textPreformat-foreground':
          'var(--vscode-textPreformat-foreground)',
        'vsc-textPreformat-background':
          'var(--vscode-textPreformat-background)',
        'vsc-textBlockQuote-background':
          'var(--vscode-textBlockQuote-background)',
        'vsc-textBlockQuote-border': 'var(--vscode-textBlockQuote-border)',
        'vsc-textCodeBlock-background':
          'var(--vscode-textCodeBlock-background)',
        'vsc-sash-hoverBorder': 'var(--vscode-sash-hoverBorder)',
        'vsc-badge-background': 'var(--vscode-badge-background)',
        'vsc-badge-foreground': 'var(--vscode-badge-foreground)',
        'vsc-scrollbar-shadow': 'var(--vscode-scrollbar-shadow)',
        'vsc-scrollbarSlider-background':
          'var(--vscode-scrollbarSlider-background)',
        'vsc-scrollbarSlider-hoverBackground':
          'var(--vscode-scrollbarSlider-hoverBackground)',
        'vsc-scrollbarSlider-activeBackground':
          'var(--vscode-scrollbarSlider-activeBackground)',
        'vsc-progressBar-background': 'var(--vscode-progressBar-background)',
        'vsc-editor-background': 'var(--vscode-editor-background)',
        'vsc-editor-foreground': 'var(--vscode-editor-foreground)',
        'vsc-editorStickyScroll-background':
          'var(--vscode-editorStickyScroll-background)',
        'vsc-editorStickyScrollHover-background':
          'var(--vscode-editorStickyScrollHover-background)',
        'vsc-editorStickyScroll-shadow':
          'var(--vscode-editorStickyScroll-shadow)',
        'vsc-editorWidget-background': 'var(--vscode-editorWidget-background)',
        'vsc-editorWidget-foreground': 'var(--vscode-editorWidget-foreground)',
        'vsc-editorWidget-border': 'var(--vscode-editorWidget-border)',
        'vsc-editorError-foreground': 'var(--vscode-editorError-foreground)',
        'vsc-editorWarning-foreground':
          'var(--vscode-editorWarning-foreground)',
        'vsc-editorInfo-foreground': 'var(--vscode-editorInfo-foreground)',
        'vsc-editorHint-foreground': 'var(--vscode-editorHint-foreground)',
        'vsc-editorLink-activeForeground':
          'var(--vscode-editorLink-activeForeground)',
        'vsc-editor-selectionBackground':
          'var(--vscode-editor-selectionBackground)',
        'vsc-editor-inactiveSelectionBackground':
          'var(--vscode-editor-inactiveSelectionBackground)',
        'vsc-editor-selectionHighlightBackground':
          'var(--vscode-editor-selectionHighlightBackground)',
        'vsc-editor-findMatchBackground':
          'var(--vscode-editor-findMatchBackground)',
        'vsc-editor-findMatchHighlightBackground':
          'var(--vscode-editor-findMatchHighlightBackground)',
        'vsc-editor-findRangeHighlightBackground':
          'var(--vscode-editor-findRangeHighlightBackground)',
        'vsc-editor-hoverHighlightBackground':
          'var(--vscode-editor-hoverHighlightBackground)',
        'vsc-editorHoverWidget-background':
          'var(--vscode-editorHoverWidget-background)',
        'vsc-editorHoverWidget-foreground':
          'var(--vscode-editorHoverWidget-foreground)',
        'vsc-editorHoverWidget-border':
          'var(--vscode-editorHoverWidget-border)',
        'vsc-editorHoverWidget-statusBarBackground':
          'var(--vscode-editorHoverWidget-statusBarBackground)',
        'vsc-editorInlayHint-foreground':
          'var(--vscode-editorInlayHint-foreground)',
        'vsc-editorInlayHint-background':
          'var(--vscode-editorInlayHint-background)',
        'vsc-editorInlayHint-typeForeground':
          'var(--vscode-editorInlayHint-typeForeground)',
        'vsc-editorInlayHint-typeBackground':
          'var(--vscode-editorInlayHint-typeBackground)',
        'vsc-editorInlayHint-parameterForeground':
          'var(--vscode-editorInlayHint-parameterForeground)',
        'vsc-editorInlayHint-parameterBackground':
          'var(--vscode-editorInlayHint-parameterBackground)',
        'vsc-editorLightBulb-foreground':
          'var(--vscode-editorLightBulb-foreground)',
        'vsc-editorLightBulbAutoFix-foreground':
          'var(--vscode-editorLightBulbAutoFix-foreground)',
        'vsc-editorLightBulbAi-foreground':
          'var(--vscode-editorLightBulbAi-foreground)',
        'vsc-editor-snippetTabstopHighlightBackground':
          'var(--vscode-editor-snippetTabstopHighlightBackground)',
        'vsc-editor-snippetFinalTabstopHighlightBorder':
          'var(--vscode-editor-snippetFinalTabstopHighlightBorder)',
        'vsc-diffEditor-insertedTextBackground':
          'var(--vscode-diffEditor-insertedTextBackground)',
        'vsc-diffEditor-removedTextBackground':
          'var(--vscode-diffEditor-removedTextBackground)',
        'vsc-diffEditor-insertedLineBackground':
          'var(--vscode-diffEditor-insertedLineBackground)',
        'vsc-diffEditor-removedLineBackground':
          'var(--vscode-diffEditor-removedLineBackground)',
        'vsc-diffEditor-diagonalFill': 'var(--vscode-diffEditor-diagonalFill)',
        'vsc-diffEditor-unchangedRegionBackground':
          'var(--vscode-diffEditor-unchangedRegionBackground)',
        'vsc-diffEditor-unchangedRegionForeground':
          'var(--vscode-diffEditor-unchangedRegionForeground)',
        'vsc-diffEditor-unchangedCodeBackground':
          'var(--vscode-diffEditor-unchangedCodeBackground)',
        'vsc-widget-shadow': 'var(--vscode-widget-shadow)',
        'vsc-widget-border': 'var(--vscode-widget-border)',
        'vsc-toolbar-hoverBackground': 'var(--vscode-toolbar-hoverBackground)',
        'vsc-toolbar-activeBackground':
          'var(--vscode-toolbar-activeBackground)',
        'vsc-breadcrumb-foreground': 'var(--vscode-breadcrumb-foreground)',
        'vsc-breadcrumb-background': 'var(--vscode-breadcrumb-background)',
        'vsc-breadcrumb-focusForeground':
          'var(--vscode-breadcrumb-focusForeground)',
        'vsc-breadcrumb-activeSelectionForeground':
          'var(--vscode-breadcrumb-activeSelectionForeground)',
        'vsc-breadcrumbPicker-background':
          'var(--vscode-breadcrumbPicker-background)',
        'vsc-merge-currentHeaderBackground':
          'var(--vscode-merge-currentHeaderBackground)',
        'vsc-merge-currentContentBackground':
          'var(--vscode-merge-currentContentBackground)',
        'vsc-merge-incomingHeaderBackground':
          'var(--vscode-merge-incomingHeaderBackground)',
        'vsc-merge-incomingContentBackground':
          'var(--vscode-merge-incomingContentBackground)',
        'vsc-merge-commonHeaderBackground':
          'var(--vscode-merge-commonHeaderBackground)',
        'vsc-merge-commonContentBackground':
          'var(--vscode-merge-commonContentBackground)',
        'vsc-editorOverviewRuler-currentContentForeground':
          'var(--vscode-editorOverviewRuler-currentContentForeground)',
        'vsc-editorOverviewRuler-incomingContentForeground':
          'var(--vscode-editorOverviewRuler-incomingContentForeground)',
        'vsc-editorOverviewRuler-commonContentForeground':
          'var(--vscode-editorOverviewRuler-commonContentForeground)',
        'vsc-editorOverviewRuler-findMatchForeground':
          'var(--vscode-editorOverviewRuler-findMatchForeground)',
        'vsc-editorOverviewRuler-selectionHighlightForeground':
          'var(--vscode-editorOverviewRuler-selectionHighlightForeground)',
        'vsc-problemsErrorIcon-foreground':
          'var(--vscode-problemsErrorIcon-foreground)',
        'vsc-problemsWarningIcon-foreground':
          'var(--vscode-problemsWarningIcon-foreground)',
        'vsc-problemsInfoIcon-foreground':
          'var(--vscode-problemsInfoIcon-foreground)',
        'vsc-input-background': 'var(--vscode-input-background)',
        'vsc-input-foreground': 'var(--vscode-input-foreground)',
        'vsc-input-border': 'var(--vscode-input-border)',
        'vsc-inputOption-activeBorder':
          'var(--vscode-inputOption-activeBorder)',
        'vsc-inputOption-hoverBackground':
          'var(--vscode-inputOption-hoverBackground)',
        'vsc-inputOption-activeBackground':
          'var(--vscode-inputOption-activeBackground)',
        'vsc-inputOption-activeForeground':
          'var(--vscode-inputOption-activeForeground)',
        'vsc-input-placeholderForeground':
          'var(--vscode-input-placeholderForeground)',
        'vsc-inputValidation-infoBackground':
          'var(--vscode-inputValidation-infoBackground)',
        'vsc-inputValidation-infoBorder':
          'var(--vscode-inputValidation-infoBorder)',
        'vsc-inputValidation-warningBackground':
          'var(--vscode-inputValidation-warningBackground)',
        'vsc-inputValidation-warningBorder':
          'var(--vscode-inputValidation-warningBorder)',
        'vsc-inputValidation-errorBackground':
          'var(--vscode-inputValidation-errorBackground)',
        'vsc-inputValidation-errorBorder':
          'var(--vscode-inputValidation-errorBorder)',
        'vsc-dropdown-background': 'var(--vscode-dropdown-background)',
        'vsc-dropdown-listBackground': 'var(--vscode-dropdown-listBackground)',
        'vsc-dropdown-foreground': 'var(--vscode-dropdown-foreground)',
        'vsc-dropdown-border': 'var(--vscode-dropdown-border)',
        'vsc-button-foreground': 'var(--vscode-button-foreground)',
        'vsc-button-separator': 'var(--vscode-button-separator)',
        'vsc-button-background': 'var(--vscode-button-background)',
        'vsc-button-hoverBackground': 'var(--vscode-button-hoverBackground)',
        'vsc-button-border': 'var(--vscode-button-border)',
        'vsc-button-secondaryForeground':
          'var(--vscode-button-secondaryForeground)',
        'vsc-button-secondaryBackground':
          'var(--vscode-button-secondaryBackground)',
        'vsc-button-secondaryHoverBackground':
          'var(--vscode-button-secondaryHoverBackground)',
        'vsc-checkbox-background': 'var(--vscode-checkbox-background)',
        'vsc-checkbox-selectBackground':
          'var(--vscode-checkbox-selectBackground)',
        'vsc-checkbox-foreground': 'var(--vscode-checkbox-foreground)',
        'vsc-checkbox-border': 'var(--vscode-checkbox-border)',
        'vsc-checkbox-selectBorder': 'var(--vscode-checkbox-selectBorder)',
        'vsc-keybindingLabel-background':
          'var(--vscode-keybindingLabel-background)',
        'vsc-keybindingLabel-foreground':
          'var(--vscode-keybindingLabel-foreground)',
        'vsc-keybindingLabel-border': 'var(--vscode-keybindingLabel-border)',
        'vsc-keybindingLabel-bottomBorder':
          'var(--vscode-keybindingLabel-bottomBorder)',
        'vsc-list-focusOutline': 'var(--vscode-list-focusOutline)',
        'vsc-list-activeSelectionBackground':
          'var(--vscode-list-activeSelectionBackground)',
        'vsc-list-activeSelectionForeground':
          'var(--vscode-list-activeSelectionForeground)',
        'vsc-list-activeSelectionIconForeground':
          'var(--vscode-list-activeSelectionIconForeground)',
        'vsc-list-inactiveSelectionBackground':
          'var(--vscode-list-inactiveSelectionBackground)',
        'vsc-list-hoverBackground': 'var(--vscode-list-hoverBackground)',
        'vsc-list-dropBackground': 'var(--vscode-list-dropBackground)',
        'vsc-list-dropBetweenBackground':
          'var(--vscode-list-dropBetweenBackground)',
        'vsc-list-highlightForeground':
          'var(--vscode-list-highlightForeground)',
        'vsc-list-focusHighlightForeground':
          'var(--vscode-list-focusHighlightForeground)',
        'vsc-list-invalidItemForeground':
          'var(--vscode-list-invalidItemForeground)',
        'vsc-list-errorForeground': 'var(--vscode-list-errorForeground)',
        'vsc-list-warningForeground': 'var(--vscode-list-warningForeground)',
        'vsc-listFilterWidget-background':
          'var(--vscode-listFilterWidget-background)',
        'vsc-listFilterWidget-outline':
          'var(--vscode-listFilterWidget-outline)',
        'vsc-listFilterWidget-noMatchesOutline':
          'var(--vscode-listFilterWidget-noMatchesOutline)',
        'vsc-listFilterWidget-shadow': 'var(--vscode-listFilterWidget-shadow)',
        'vsc-list-filterMatchBackground':
          'var(--vscode-list-filterMatchBackground)',
        'vsc-list-deemphasizedForeground':
          'var(--vscode-list-deemphasizedForeground)',
        'vsc-tree-indentGuidesStroke': 'var(--vscode-tree-indentGuidesStroke)',
        'vsc-tree-inactiveIndentGuidesStroke':
          'var(--vscode-tree-inactiveIndentGuidesStroke)',
        'vsc-tree-tableColumnsBorder': 'var(--vscode-tree-tableColumnsBorder)',
        'vsc-tree-tableOddRowsBackground':
          'var(--vscode-tree-tableOddRowsBackground)',
        'vsc-menu-border': 'var(--vscode-menu-border)',
        'vsc-menu-foreground': 'var(--vscode-menu-foreground)',
        'vsc-menu-background': 'var(--vscode-menu-background)',
        'vsc-menu-selectionForeground':
          'var(--vscode-menu-selectionForeground)',
        'vsc-menu-selectionBackground':
          'var(--vscode-menu-selectionBackground)',
        'vsc-menu-separatorBackground':
          'var(--vscode-menu-separatorBackground)',
        'vsc-minimap-findMatchHighlight':
          'var(--vscode-minimap-findMatchHighlight)',
        'vsc-minimap-selectionOccurrenceHighlight':
          'var(--vscode-minimap-selectionOccurrenceHighlight)',
        'vsc-minimap-selectionHighlight':
          'var(--vscode-minimap-selectionHighlight)',
        'vsc-minimap-infoHighlight': 'var(--vscode-minimap-infoHighlight)',
        'vsc-minimap-warningHighlight':
          'var(--vscode-minimap-warningHighlight)',
        'vsc-minimap-errorHighlight': 'var(--vscode-minimap-errorHighlight)',
        'vsc-minimap-foregroundOpacity':
          'var(--vscode-minimap-foregroundOpacity)',
        'vsc-minimapSlider-background':
          'var(--vscode-minimapSlider-background)',
        'vsc-minimapSlider-hoverBackground':
          'var(--vscode-minimapSlider-hoverBackground)',
        'vsc-minimapSlider-activeBackground':
          'var(--vscode-minimapSlider-activeBackground)',
        'vsc-charts-foreground': 'var(--vscode-charts-foreground)',
        'vsc-charts-lines': 'var(--vscode-charts-lines)',
        'vsc-charts-red': 'var(--vscode-charts-red)',
        'vsc-charts-blue': 'var(--vscode-charts-blue)',
        'vsc-charts-yellow': 'var(--vscode-charts-yellow)',
        'vsc-charts-orange': 'var(--vscode-charts-orange)',
        'vsc-charts-green': 'var(--vscode-charts-green)',
        'vsc-charts-purple': 'var(--vscode-charts-purple)',
        'vsc-quickInput-background': 'var(--vscode-quickInput-background)',
        'vsc-quickInput-foreground': 'var(--vscode-quickInput-foreground)',
        'vsc-quickInputTitle-background':
          'var(--vscode-quickInputTitle-background)',
        'vsc-pickerGroup-foreground': 'var(--vscode-pickerGroup-foreground)',
        'vsc-pickerGroup-border': 'var(--vscode-pickerGroup-border)',
        'vsc-quickInputList-focusForeground':
          'var(--vscode-quickInputList-focusForeground)',
        'vsc-quickInputList-focusIconForeground':
          'var(--vscode-quickInputList-focusIconForeground)',
        'vsc-quickInputList-focusBackground':
          'var(--vscode-quickInputList-focusBackground)',
        'vsc-search-resultsInfoForeground':
          'var(--vscode-search-resultsInfoForeground)',
        'vsc-searchEditor-findMatchBackground':
          'var(--vscode-searchEditor-findMatchBackground)',
        'vsc-multiDiffEditor-headerBackground':
          'var(--vscode-multiDiffEditor-headerBackground)',
        'vsc-multiDiffEditor-border': 'var(--vscode-multiDiffEditor-border)',
        'vsc-symbolIcon-arrayForeground':
          'var(--vscode-symbolIcon-arrayForeground)',
        'vsc-symbolIcon-booleanForeground':
          'var(--vscode-symbolIcon-booleanForeground)',
        'vsc-symbolIcon-classForeground':
          'var(--vscode-symbolIcon-classForeground)',
        'vsc-symbolIcon-colorForeground':
          'var(--vscode-symbolIcon-colorForeground)',
        'vsc-symbolIcon-constantForeground':
          'var(--vscode-symbolIcon-constantForeground)',
        'vsc-symbolIcon-constructorForeground':
          'var(--vscode-symbolIcon-constructorForeground)',
        'vsc-symbolIcon-enumeratorForeground':
          'var(--vscode-symbolIcon-enumeratorForeground)',
        'vsc-symbolIcon-enumeratorMemberForeground':
          'var(--vscode-symbolIcon-enumeratorMemberForeground)',
        'vsc-symbolIcon-eventForeground':
          'var(--vscode-symbolIcon-eventForeground)',
        'vsc-symbolIcon-fieldForeground':
          'var(--vscode-symbolIcon-fieldForeground)',
        'vsc-symbolIcon-fileForeground':
          'var(--vscode-symbolIcon-fileForeground)',
        'vsc-symbolIcon-folderForeground':
          'var(--vscode-symbolIcon-folderForeground)',
        'vsc-symbolIcon-functionForeground':
          'var(--vscode-symbolIcon-functionForeground)',
        'vsc-symbolIcon-interfaceForeground':
          'var(--vscode-symbolIcon-interfaceForeground)',
        'vsc-symbolIcon-keyForeground':
          'var(--vscode-symbolIcon-keyForeground)',
        'vsc-symbolIcon-keywordForeground':
          'var(--vscode-symbolIcon-keywordForeground)',
        'vsc-symbolIcon-methodForeground':
          'var(--vscode-symbolIcon-methodForeground)',
        'vsc-symbolIcon-moduleForeground':
          'var(--vscode-symbolIcon-moduleForeground)',
        'vsc-symbolIcon-namespaceForeground':
          'var(--vscode-symbolIcon-namespaceForeground)',
        'vsc-symbolIcon-nullForeground':
          'var(--vscode-symbolIcon-nullForeground)',
        'vsc-symbolIcon-numberForeground':
          'var(--vscode-symbolIcon-numberForeground)',
      },
    },
  },
  plugins: [],
};
