# License Selector State Graph

> **Auto-generated documentation** - Run `npm run generate-graph` to update

## Overview

This document visualizes the decision tree used by the Public License Selector. The selector guides users through a series of questions to recommend appropriate licenses for their software or data.

Edge labels on path-specific diagrams include filter operations applied at each step: **+category** keeps only licenses with that category; **−category** removes them. Terminal nodes show the exact set of licenses reachable along that path.

## Complete State Graph

```mermaid
%%{init: {'theme':'base', 'themeVariables': { 'fontSize':'16px'}, 'flowchart':{'curve':'basis', 'padding':20}}}%%
flowchart TD
    Start([Start]) --> KindOfContent

    KindOfContent{"What do you want to deposit?"}
    DataCopyrightable(["Is your data within the scope of copyright
and related rights?"])
    class DataCopyrightable dataPath
    OwnIPR{"Do you own copyright and similar rights in
your dataset and all its constitutive parts?"}
    class OwnIPR dataPath
    AllowDerivativeWorks(["Do you allow others to make derivative works?"])
    class AllowDerivativeWorks dataPath
    ShareAlike(["Do you require others to share derivative
works based on your data under a compatible
license?"])
    class ShareAlike dataPath
    CommercialUse(["Do you allow others to make commercial use of
you data?"])
    class CommercialUse dataPath
    DecideAttribute(["Do you want others to attribute your data to
you?"])
    class DecideAttribute dataPath
    EnsureLicensing(["Are all the elements of your dataset licensed
under a public license or in the Public
Domain?"])
    class EnsureLicensing dataPath
    LicenseInteropData(["Choose licenses present in your dataset:"])
    class LicenseInteropData dataPath
    YourSoftware["Is your code based on existing software or is
it your original work?"]
    class YourSoftware softwarePath
    LicenseInteropSoftware(["Select licenses in your code:"])
    class LicenseInteropSoftware softwarePath
    Copyleft(["Do you require others who modify your code to
release it under a compatible licence?"])
    class Copyleft softwarePath
    StrongCopyleft(["Is your code used directly as an executable
or are you licensing a library (your code
will be linked)?"])
    class StrongCopyleft softwarePath

    KindOfContent -->|"Software −data"| YourSoftware
    KindOfContent -->|"Data −software"| DataCopyrightable
    DataCopyrightable -->|"Yes"| OwnIPR
    OwnIPR -->|"Yes"| AllowDerivativeWorks
    OwnIPR -->|"No"| EnsureLicensing
    AllowDerivativeWorks -->|"Yes −nd"| ShareAlike
    AllowDerivativeWorks -->|"No +nd"| CommercialUse
    ShareAlike -->|"Yes +sa"| CommercialUse
    ShareAlike -->|"No −sa"| CommercialUse
    CommercialUse -->|"Yes −nc"| DecideAttribute
    EnsureLicensing -->|"Yes"| LicenseInteropData
    LicenseInteropData -->|"Next"| AllowDerivativeWorks
    YourSoftware -->|"Based on existing software"| LicenseInteropSoftware
    YourSoftware -->|"My own code"| Copyleft
    LicenseInteropSoftware -->|"Next"| Copyleft
    LicenseInteropSoftware -->|"Next"| StrongCopyleft
    Copyleft -->|"Yes +copyleft"| StrongCopyleft
    DataCopyrightable -->|"No"| End([Select License])
    AllowDerivativeWorks -->|"No +nd"| End([Select License])
    ShareAlike -->|"Yes +sa"| End([Select License])
    ShareAlike -->|"No −sa"| End([Select License])
    CommercialUse -->|"Yes −nc"| End([Select License])
    CommercialUse -->|"No +nc +by"| End([Select License])
    DecideAttribute -->|"Yes +by"| End([Select License])
    DecideAttribute -->|"No +public-domain"| End([Select License])
    LicenseInteropData -->|"Next"| End([Select License])
    LicenseInteropSoftware -->|"Next"| End([Select License])
    Copyleft -->|"Yes +copyleft"| End([Select License])
    Copyleft -->|"No −copyleft +permissive"| End([Select License])
    StrongCopyleft -->|"Executable +strong"| End([Select License])
    StrongCopyleft -->|"Library +weak"| End([Select License])
    EnsureLicensing -->|"No"| Error([Cannot License])
    LicenseInteropData -->|"Next"| Error([Cannot License])
    LicenseInteropSoftware -->|"Next"| Error([Cannot License])

    classDef dataPath fill:#e1f5ff,stroke:#01579b,stroke-width:2px,padding:15px,min-width:250px
    classDef softwarePath fill:#f3e5f5,stroke:#4a148c,stroke-width:2px,padding:15px,min-width:250px
    classDef terminalNode fill:#c8e6c9,stroke:#2e7d32,stroke-width:3px,padding:15px
    classDef errorNode fill:#ffcdd2,stroke:#c62828,stroke-width:3px,padding:15px
```

## Data Licensing Path

```mermaid
%%{init: {'theme':'base', 'themeVariables': { 'fontSize':'16px'}, 'flowchart':{'curve':'basis', 'padding':20}}}%%
flowchart TD
    Start([Start]) --> KindOfContent

    KindOfContent{"What do you want to deposit?"}
    DataCopyrightable(["Is your data within the scope of copyright
and related rights?"])
    class DataCopyrightable dataPath
    OwnIPR{"Do you own copyright and similar rights in
your dataset and all its constitutive parts?"}
    class OwnIPR dataPath
    AllowDerivativeWorks(["Do you allow others to make derivative works?"])
    class AllowDerivativeWorks dataPath
    ShareAlike(["Do you require others to share derivative
works based on your data under a compatible
license?"])
    class ShareAlike dataPath
    CommercialUse(["Do you allow others to make commercial use of
you data?"])
    class CommercialUse dataPath
    DecideAttribute(["Do you want others to attribute your data to
you?"])
    class DecideAttribute dataPath
    EnsureLicensing(["Are all the elements of your dataset licensed
under a public license or in the Public
Domain?"])
    class EnsureLicensing dataPath
    LicenseInteropData(["Choose licenses present in your dataset:"])
    class LicenseInteropData dataPath

    KindOfContent -->|"Data −software"| DataCopyrightable
    DataCopyrightable -->|"Yes"| OwnIPR
    OwnIPR -->|"Yes"| AllowDerivativeWorks
    OwnIPR -->|"No"| EnsureLicensing
    AllowDerivativeWorks -->|"Yes −nd"| ShareAlike
    AllowDerivativeWorks -->|"No +nd"| CommercialUse
    ShareAlike -->|"Yes +sa"| CommercialUse
    ShareAlike -->|"No −sa"| CommercialUse
    CommercialUse -->|"Yes −nc"| DecideAttribute
    EnsureLicensing -->|"Yes"| LicenseInteropData
    LicenseInteropData -->|"Next"| AllowDerivativeWorks
    DataCopyrightable -->|"No"| Term_0
    Term_0(["CC-PUBLIC-DOMAIN"])
    class Term_0 terminalNode
    CommercialUse -->|"Yes −nc"| Term_1
    Term_1(["CC-BY-SA"])
    class Term_1 terminalNode
    CommercialUse -->|"No +nc +by"| Term_2
    Term_2(["CC-BY-NC-SA"])
    class Term_2 terminalNode
    CommercialUse -->|"No +nc +by"| Term_3
    Term_3(["CC-BY-NC"])
    class Term_3 terminalNode
    DecideAttribute -->|"Yes +by"| Term_4
    Term_4(["CC-BY"])
    class Term_4 terminalNode
    DecideAttribute -->|"No +public-domain"| Term_5
    Term_5(["CC-ZERO"])
    class Term_5 terminalNode
    CommercialUse -->|"Yes −nc"| Term_6
    Term_6(["CC-BY-ND"])
    class Term_6 terminalNode
    CommercialUse -->|"No +nc +by"| Term_7
    Term_7(["CC-BY-NC-ND"])
    class Term_7 terminalNode
    EnsureLicensing -->|"No"| Term_8
    Term_8(["Cannot License"])
    class Term_8 errorNode
    LicenseInteropData -->|"Next"| Term_9
    Term_9(["CC-BY-NC-SA"])
    class Term_9 terminalNode
    LicenseInteropData -->|"Next"| Term_10
    Term_10(["ODBL, CC-BY-SA"])
    class Term_10 terminalNode
    LicenseInteropData -->|"Next"| Term_11
    Term_11(["CC-BY-SA"])
    class Term_11 terminalNode
    LicenseInteropData -->|"Next"| Term_12
    Term_12(["Cannot License"])
    class Term_12 errorNode

    classDef dataPath fill:#e1f5ff,stroke:#01579b,stroke-width:2px,padding:15px,min-width:250px
    classDef softwarePath fill:#f3e5f5,stroke:#4a148c,stroke-width:2px,padding:15px,min-width:250px
    classDef terminalNode fill:#c8e6c9,stroke:#2e7d32,stroke-width:3px,padding:15px
    classDef errorNode fill:#ffcdd2,stroke:#c62828,stroke-width:3px,padding:15px
```

## Software Licensing Path

```mermaid
%%{init: {'theme':'base', 'themeVariables': { 'fontSize':'16px'}, 'flowchart':{'curve':'basis', 'padding':20}}}%%
flowchart TD
    Start([Start]) --> KindOfContent

    KindOfContent{"What do you want to deposit?"}
    YourSoftware["Is your code based on existing software or is
it your original work?"]
    class YourSoftware softwarePath
    LicenseInteropSoftware(["Select licenses in your code:"])
    class LicenseInteropSoftware softwarePath
    Copyleft(["Do you require others who modify your code to
release it under a compatible licence?"])
    class Copyleft softwarePath
    StrongCopyleft(["Is your code used directly as an executable
or are you licensing a library (your code
will be linked)?"])
    class StrongCopyleft softwarePath

    KindOfContent -->|"Software −data"| YourSoftware
    YourSoftware -->|"Based on existing software"| LicenseInteropSoftware
    YourSoftware -->|"My own code"| Copyleft
    LicenseInteropSoftware -->|"Next"| Copyleft
    LicenseInteropSoftware -->|"Next"| StrongCopyleft
    Copyleft -->|"Yes +copyleft"| StrongCopyleft
    LicenseInteropSoftware -->|"Next"| Term_0
    Term_0(["Cannot License"])
    class Term_0 errorNode
    Copyleft -->|"No −copyleft +permissive"| Term_1
    Term_1(["MIT, BSD-3C, BSD-2C, APACHE-2"])
    class Term_1 terminalNode
    StrongCopyleft -->|"Executable +strong"| Term_2
    Term_2(["GPL-2+, GPL-3, AGPL-3"])
    class Term_2 terminalNode
    StrongCopyleft -->|"Library +weak"| Term_3
    Term_3(["MPL-2, LGPL-2.1+, LGPL-3, EPL-1
CDDL-1"])
    class Term_3 terminalNode

    classDef dataPath fill:#e1f5ff,stroke:#01579b,stroke-width:2px,padding:15px,min-width:250px
    classDef softwarePath fill:#f3e5f5,stroke:#4a148c,stroke-width:2px,padding:15px,min-width:250px
    classDef terminalNode fill:#c8e6c9,stroke:#2e7d32,stroke-width:3px,padding:15px
    classDef errorNode fill:#ffcdd2,stroke:#c62828,stroke-width:3px,padding:15px
```

## State Reference Table

| State | Question | Transitions | Type |
|-------|----------|-------------|------|
| KindOfContent | What do you want to deposit? | → YourSoftware<br>→ DataCopyrightable | Question |
| DataCopyrightable | Is your data within the scope of copyright and related rights? | → OwnIPR | ✅ Terminal |
| OwnIPR | Do you own copyright and similar rights in your dataset and all its constitutive parts? | → AllowDerivativeWorks<br>→ EnsureLicensing | Question |
| AllowDerivativeWorks | Do you allow others to make derivative works? | → ShareAlike<br>→ CommercialUse | ✅ Terminal (Conditional) |
| ShareAlike | Do you require others to share derivative works based on your data under a compatible license? | → CommercialUse<br>→ CommercialUse | ✅ Terminal (Conditional) |
| CommercialUse | Do you allow others to make commercial use of you data? | → DecideAttribute | ✅ Terminal (Conditional) |
| DecideAttribute | Do you want others to attribute your data to you? | N/A | ✅ Terminal |
| EnsureLicensing | Are all the elements of your dataset licensed under a public license or in the Public Domain? | → LicenseInteropData | ❌ Error |
| LicenseInteropData | Choose licenses present in your dataset: | → AllowDerivativeWorks<br>→ AllowDerivativeWorks<br>→ AllowDerivativeWorks | ❌ Error |
| YourSoftware | Is your code based on existing software or is it your original work? | → LicenseInteropSoftware<br>→ Copyleft | Question |
| LicenseInteropSoftware | Select licenses in your code: | → Copyleft<br>→ StrongCopyleft | ❌ Error (Conditional) |
| Copyleft | Do you require others who modify your code to release it under a compatible licence? | → StrongCopyleft | ✅ Terminal (Conditional) |
| StrongCopyleft | Is your code used directly as an executable or are you licensing a library (your code will be linked)? | N/A | ✅ Terminal |


## Legend

- 🔹 **Blue nodes**: Data licensing path
- 🔸 **Purple nodes**: Software licensing path
- ✅ **Green nodes**: Terminal states — license set shown inside node
- ❌ **Red nodes**: Error states (cannot license)
- ♦️ **Diamond shapes**: Yes/No decisions
- ⬜ **Rectangles**: Multi-option questions
- **Edge labels**: `+cat` keeps licenses with category; `−cat` removes them

## How to Update

1. Modify `src/data/questions.coffee`
2. Run `npm run generate-graph`
3. Review the updated diagrams in this file
4. Commit changes to version control

## Related Files

- **Question Definitions**: `src/data/questions.coffee`
- **License Data**: `src/data/licenses.coffee`
- **Compatibility Matrix**: `src/data/compatibility.coffee`
- **Generator Script**: `scripts/generate-state-graph.js`
