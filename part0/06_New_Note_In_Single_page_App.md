```mermaid
sequenceDiagram
participant browser
participant server

    browser->>server: POST https://studies.cs.helsinki.fi/exampleapp/new_note_spa
    activate server
    server-->>browser: JSON containing the created note
    deactivate server

    Note right of browser: JavaScript callback updates the DOM with the new note
```
