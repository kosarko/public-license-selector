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
and/or special right of the database maker?"])
    class DataCopyrightable dataPath
    AllOriginal{"Is everything in the dataset your original
work?"}
    class AllOriginal dataPath
    AllowDerivativeWorks(["Do you allow others to make derivative works?"])
    class AllowDerivativeWorks dataPath
    ShareAlike(["Do you require others to share derivative
works based on your data under the same
license?"])
    class ShareAlike dataPath
    CommercialUse(["Do you allow others to use your data
commercially?"])
    class CommercialUse dataPath
    DecideAttribute(["Do you want others to attribute your data to
you?"])
    class DecideAttribute dataPath
    EnsureLicensing(["Is the third-party content of the dataset
licensed under a public license / in the
public domain?"])
    class EnsureLicensing dataPath
    LicenseInteropData(["Under which license was the third-party
content that you changed licensed?"])
    class LicenseInteropData dataPath
    Changed3dPartyContent{"Have you made any changes to the third-party
content of the dataset?"}
    class Changed3dPartyContent dataPath
    YourSoftware["Is your software based on existing code or is
it all your original work?"]
    class YourSoftware softwarePath
    LicenseInteropSoftware(["Select licenses of the code in your software:"])
    class LicenseInteropSoftware softwarePath
    ModifyingOrUsing(["Are you modifying the existing software or is
the existing software only being used as a
part of your larger work?"])
    class ModifyingOrUsing softwarePath
    Copyleft(["Do you require others who use your code in
their software to release it under a
compatible open-source license?"])
    class Copyleft softwarePath
    StrongCopyleft(["Do you require others to use a compatible
open-source license for the software as a
whole or only for the parts that modified
your code?"])
    class StrongCopyleft softwarePath

    KindOfContent -->|"Software −data"| YourSoftware
    KindOfContent -->|"Data −software"| DataCopyrightable
    DataCopyrightable -->|"Yes"| AllOriginal
    AllOriginal -->|"Yes"| AllowDerivativeWorks
    AllOriginal -->|"No"| EnsureLicensing
    AllowDerivativeWorks -->|"Yes −nd"| ShareAlike
    AllowDerivativeWorks -->|"No +nd"| CommercialUse
    ShareAlike -->|"Yes +sa"| CommercialUse
    ShareAlike -->|"No −sa"| CommercialUse
    CommercialUse -->|"Yes −nc"| DecideAttribute
    EnsureLicensing -->|"Yes"| Changed3dPartyContent
    LicenseInteropData -->|"Next"| AllowDerivativeWorks
    Changed3dPartyContent -->|"Yes"| LicenseInteropData
    Changed3dPartyContent -->|"No"| AllowDerivativeWorks
    YourSoftware -->|"Based on existing software"| LicenseInteropSoftware
    YourSoftware -->|"Original work"| Copyleft
    LicenseInteropSoftware -->|"Next [has(copyleft,permissive)]"| Copyleft
    LicenseInteropSoftware -->|"Next"| ModifyingOrUsing
    ModifyingOrUsing -->|"Using"| Copyleft
    Copyleft -->|"Yes +copyleft [has(weak,strong)]"| StrongCopyleft
    DataCopyrightable -->|"No"| End([Select License])
    AllowDerivativeWorks -->|"No +nd"| End([Select License])
    ShareAlike -->|"Yes +sa"| End([Select License])
    ShareAlike -->|"No −sa"| End([Select License])
    CommercialUse -->|"Yes −nc"| End([Select License])
    CommercialUse -->|"No +nc +by"| End([Select License])
    DecideAttribute -->|"Yes +by"| End([Select License])
    DecideAttribute -->|"No +public-domain"| End([Select License])
    LicenseInteropData -->|"Next"| End([Select License])
    LicenseInteropSoftware -->|"Next [else has(copyleft,permissive)]"| End([Select License])
    ModifyingOrUsing -->|"Modifying"| End([Select License])
    Copyleft -->|"Yes +copyleft [else has(weak,strong)]"| End([Select License])
    Copyleft -->|"No −copyleft"| End([Select License])
    StrongCopyleft -->|"For the software as a whole +strong"| End([Select License])
    StrongCopyleft -->|"Only for modified parts +weak"| End([Select License])
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
and/or special right of the database maker?"])
    class DataCopyrightable dataPath
    AllOriginal{"Is everything in the dataset your original
work?"}
    class AllOriginal dataPath
    AllowDerivativeWorks(["Do you allow others to make derivative works?"])
    class AllowDerivativeWorks dataPath
    ShareAlike(["Do you require others to share derivative
works based on your data under the same
license?"])
    class ShareAlike dataPath
    CommercialUse(["Do you allow others to use your data
commercially?"])
    class CommercialUse dataPath
    DecideAttribute(["Do you want others to attribute your data to
you?"])
    class DecideAttribute dataPath
    EnsureLicensing(["Is the third-party content of the dataset
licensed under a public license / in the
public domain?"])
    class EnsureLicensing dataPath
    LicenseInteropData(["Under which license was the third-party
content that you changed licensed?"])
    class LicenseInteropData dataPath
    Changed3dPartyContent{"Have you made any changes to the third-party
content of the dataset?"}
    class Changed3dPartyContent dataPath

    KindOfContent -->|"Data −software"| DataCopyrightable
    DataCopyrightable -->|"Yes"| AllOriginal
    AllOriginal -->|"Yes"| AllowDerivativeWorks
    AllOriginal -->|"No"| EnsureLicensing
    AllowDerivativeWorks -->|"Yes −nd"| ShareAlike
    AllowDerivativeWorks -->|"No +nd"| CommercialUse
    ShareAlike -->|"Yes +sa"| CommercialUse
    ShareAlike -->|"No −sa"| CommercialUse
    CommercialUse -->|"Yes −nc"| DecideAttribute
    EnsureLicensing -->|"Yes"| Changed3dPartyContent
    LicenseInteropData -->|"Next"| AllowDerivativeWorks
    Changed3dPartyContent -->|"Yes"| LicenseInteropData
    Changed3dPartyContent -->|"No"| AllowDerivativeWorks
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
    EnsureLicensing -->|"No"| CannotLicense
    CannotLicense(["Cannot License"])
    class CannotLicense errorNode
    LicenseInteropData -->|"Next"| Term_9
    Term_9(["CC-BY-NC-SA"])
    class Term_9 terminalNode
    LicenseInteropData -->|"Next"| Term_10
    Term_10(["ODBL, CC-BY-SA"])
    class Term_10 terminalNode
    LicenseInteropData -->|"Next"| Term_11
    Term_11(["CC-BY-SA"])
    class Term_11 terminalNode
    LicenseInteropData -->|"Next"| CannotLicense

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
    YourSoftware["Is your software based on existing code or is
it all your original work?"]
    class YourSoftware softwarePath
    LicenseInteropSoftware(["Select licenses of the code in your software:"])
    class LicenseInteropSoftware softwarePath
    ModifyingOrUsing(["Are you modifying the existing software or is
the existing software only being used as a
part of your larger work?"])
    class ModifyingOrUsing softwarePath
    Copyleft(["Do you require others who use your code in
their software to release it under a
compatible open-source license?"])
    class Copyleft softwarePath
    StrongCopyleft(["Do you require others to use a compatible
open-source license for the software as a
whole or only for the parts that modified
your code?"])
    class StrongCopyleft softwarePath

    KindOfContent -->|"Software −data"| YourSoftware
    YourSoftware -->|"Based on existing software"| LicenseInteropSoftware
    YourSoftware -->|"Original work"| Copyleft
    LicenseInteropSoftware -->|"Next [has(copyleft,permissive)]"| Copyleft
    LicenseInteropSoftware -->|"Next"| ModifyingOrUsing
    ModifyingOrUsing -->|"Using"| Copyleft
    Copyleft -->|"Yes +copyleft [has(weak,strong)]"| StrongCopyleft
    LicenseInteropSoftware -->|"Next [else has(copyleft,permissive)]"| Term_0
    Term_0(["Select License"])
    class Term_0 terminalNode
    LicenseInteropSoftware -->|"Next"| CannotLicense
    CannotLicense(["Cannot License"])
    class CannotLicense errorNode
    ModifyingOrUsing -->|"Modifying"| Term_2
    Term_2(["Select License"])
    class Term_2 terminalNode
    Copyleft -->|"Yes +copyleft [else has(weak,strong)]"| Term_3
    Term_3(["GPL-2+, GPL-3, AGPL-3, MPL-2
LGPL-2.1+, LGPL-3, EPL-1, CDDL-1"])
    class Term_3 terminalNode
    Copyleft -->|"No −copyleft"| Term_4
    Term_4(["PERL-ARTISTIC-1, PERL-ARTISTIC-2
MIT, BSD-3C, BSD-2C, APACHE-2"])
    class Term_4 terminalNode
    StrongCopyleft -->|"For the software as a whole +strong"| Term_5
    Term_5(["GPL-2+, GPL-3, AGPL-3"])
    class Term_5 terminalNode
    StrongCopyleft -->|"Only for modified parts +weak"| Term_6
    Term_6(["MPL-2, LGPL-2.1+, LGPL-3, EPL-1
CDDL-1"])
    class Term_6 terminalNode

    classDef dataPath fill:#e1f5ff,stroke:#01579b,stroke-width:2px,padding:15px,min-width:250px
    classDef softwarePath fill:#f3e5f5,stroke:#4a148c,stroke-width:2px,padding:15px,min-width:250px
    classDef terminalNode fill:#c8e6c9,stroke:#2e7d32,stroke-width:3px,padding:15px
    classDef errorNode fill:#ffcdd2,stroke:#c62828,stroke-width:3px,padding:15px
```

## State Reference Table

| State | Question | Transitions | Type |
|-------|----------|-------------|------|
| KindOfContent | What do you want to deposit? | → YourSoftware<br>→ DataCopyrightable | Question |
| DataCopyrightable | Is your data within the scope of copyright and/or special right of the database maker? | → AllOriginal | ✅ Terminal |
| AllOriginal | Is everything in the dataset your original work? | → AllowDerivativeWorks<br>→ EnsureLicensing | Question |
| AllowDerivativeWorks | Do you allow others to make derivative works? | → ShareAlike<br>→ CommercialUse | ✅ Terminal (Conditional) |
| ShareAlike | Do you require others to share derivative works based on your data under the same license? | → CommercialUse<br>→ CommercialUse | ✅ Terminal (Conditional) |
| CommercialUse | Do you allow others to use your data commercially? | → DecideAttribute | ✅ Terminal (Conditional) |
| DecideAttribute | Do you want others to attribute your data to you? | N/A | ✅ Terminal |
| EnsureLicensing | Is the third-party content of the dataset licensed under a public license / in the public domain?  | → Changed3dPartyContent | ❌ Error |
| LicenseInteropData | Under which license was the third-party content that you changed licensed? | → AllowDerivativeWorks<br>→ AllowDerivativeWorks<br>→ AllowDerivativeWorks | ❌ Error |
| Changed3dPartyContent | Have you made any changes to the third-party content of the dataset? | → LicenseInteropData<br>→ AllowDerivativeWorks | Question |
| YourSoftware | Is your software based on existing code or is it all your original work? | → LicenseInteropSoftware<br>→ Copyleft | Question |
| LicenseInteropSoftware | Select licenses of the code in your software: | → Copyleft<br>→ ModifyingOrUsing | ❌ Error (Conditional) |
| ModifyingOrUsing | Are you modifying the existing software or is the existing software only being used as a part of your larger work? | → Copyleft | ✅ Terminal |
| Copyleft | Do you require others who use your code in their software to release it under a compatible open-source license? | → StrongCopyleft | ✅ Terminal (Conditional) |
| StrongCopyleft | Do you require others to use a compatible open-source license for the software as a whole or only for the parts that modified your code? | N/A | ✅ Terminal |


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
