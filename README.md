Level Editor

Simple level editor.

How to Run

1. Install:

* npm install



2. Start server:

* npm run dev



3. Open browser: http://localhost:3000



Element Types

* Catapult (brown) - where player shoots from
* Enemy (green circle) - targets to hit
* Ground (dark brown) - platforms
* Wood (orange) - breakable blocks
* Stone (gray) - strong blocks
* TNT (red) - explodes



How to Use

* Click buttons to add elements
* Drag elements to move them
* Right-click to delete
* Enter level ID and click Save/Load/Delete



API Endpoints

* GET /api/v1/levels/:id - load a level
* POST /api/v1/levels - create new level
* PUT /api/v1/levels/:id - update or create level
* DELETE /api/v1/levels/:id - delete a level



GitHub: https://github.com/NickTAM1/leveleditor.git

