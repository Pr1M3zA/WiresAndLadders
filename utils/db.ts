import Toast from 'react-native-toast-message';
import * as SQLite from 'expo-sqlite';
import type { BoardBackgroundType, DbBoardType, TileType, DiceType, EducationType, EffectType, ShortCutType } from '@/utils/types';

const SyncBoardData = async (apiURL: string, db: SQLite.SQLiteDatabase, dropTables: boolean = false) => {
   // Abrimos (o creamos si no existe) la base de datos
   const toSync = {bg: false, boards: false, tiles: false, shortcuts: false, tileTypes: false, dices: false, education: false}
   if (dropTables) await DbDropTables(db);
   // Si no existen, creamos la estructura de tablas, indices y vistas
   await DbCreateTables(db); 
   // Checar Board Backgrounds en local db
   await db.getFirstAsync('SELECT id FROM board_backgrounds')
      .then(data => { toSync.bg = !data; })
      .catch(error => { Toast.show({ type: 'error', text1: 'Error (chk bg local)', text2: error.message }) });
   // Checar Boards en local db
   await db.getFirstAsync('SELECT id FROM boards')
      .then(data => { toSync.boards = !data; })
      .catch(error => { Toast.show({ type: 'error', text1: 'Error (chk Boards local)', text2: error.message }) });
   // Checar Tiles en local db
   await db.getFirstAsync('SELECT id FROM tiles')
      .then(data => { toSync.tiles = !data; })
      .catch(error => { Toast.show({ type: 'error', text1: 'Error (chk Tiles local)', text2: error.message }) });      
   // Checar Shortcuts en local db
   await db.getFirstAsync('SELECT id FROM shortcuts')
      .then(data => { toSync.shortcuts = !data; })
      .catch(error => { Toast.show({ type: 'error', text1: 'Error (chk Shortcuts local)', text2: error.message }) });      
   // Checar Tile Types en local db
   await db.getFirstAsync('SELECT id FROM tile_types')
      .then(data => { toSync.tileTypes = !data; })
      .catch(error => { Toast.show({ type: 'error', text1: 'Error (chk Tile Types local)', text2: error.message }) });   
      // Checar Dices en local db
   await db.getFirstAsync('SELECT id FROM dices')
      .then(data => { toSync.dices = !data; })
      .catch(error => { Toast.show({ type: 'error', text1: 'Error (chk Dices local)', text2: error.message }) });  
   // Checar Education Data en local db
   await db.getFirstAsync('SELECT id, generation, theme, information, question, answer_1, answer_2, answer_3, answer_4, answer_ok FROM education')
      .then(data => { toSync.education = !data; })
      .catch(error => { Toast.show({ type: 'error', text1: 'Error (chk Education local)', text2: error.message }) });

   if(toSync.bg) await GetRemoteBoards(db, apiURL);
   if(toSync.boards) await GetRemoteBackgrounds(db, apiURL);
   if(toSync.tiles) await GetRemoteTiles(db, apiURL);
   if(toSync.shortcuts) await GetRemoteShortcuts(db, apiURL);
   if(toSync.tileTypes) await GetRemoteTileTypes(db, apiURL);
   if(toSync.dices) await GetRemoteDices(db, apiURL);
   if(toSync.education) await GetRemoteEducation(db, apiURL);
   
   //await db.closeAsync();
 
}

const fetchAndInsertAll = async <T>(db: SQLite.SQLiteDatabase, url: string, insertFn: (db: SQLite.SQLiteDatabase, row: T) => Promise<void>) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  const data: T[] = await res.json();
  // Crear array de promesas (NO forEach)
  const promises = data.map((row: T) => insertFn(db, row));
  await Promise.all(promises); // esperar que todas terminen
};

/*-----------------
   BACKGROUNDS
----------------*/
const GetRemoteBackgrounds = async (db: SQLite.SQLiteDatabase, apiURL: string) => {
  await fetchAndInsertAll<BoardBackgroundType>(db, `${apiURL}/sync/board-backgrounds`, InsertLocalBackground)
    .catch(error => Toast.show({ type: 'error', text1: 'Error (get Remote bg)', text2: error.message }));
};

const InsertLocalBackground = async (db: SQLite.SQLiteDatabase, row: BoardBackgroundType) => {
   await db.runAsync(`INSERT INTO board_backgrounds (background_name, rect_width, rect_height, color_rect, color_path1, color_path2, path1, path2) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, row.background_name, row.rect_width, row.rect_height, row.color_rect, row.color_path1, row.color_path2, row.path1, row.path2)
   .catch(error => Toast.show({ type: 'error', text1: 'Error (Ins Local Background)', text2: error.message }))	
}
/*-----------------
   BOARDS
----------------*/
const GetRemoteBoards = async (db: SQLite.SQLiteDatabase, apiURL: string) => {
  await fetchAndInsertAll<DbBoardType>(db, `${apiURL}/sync/boards`, InsertLocalBoard)
    .catch(error => Toast.show({ type: 'error', text1: 'Error (get Remote boards)', text2: error.message }));
};
const InsertLocalBoard = async (db: SQLite.SQLiteDatabase, row: DbBoardType) => {
   await db.runAsync(`INSERT INTO boards (id, board_name, board_description, id_background, width, height, education) 
      VALUES (?, ?, ?, ?, ?, ?, ?)`, row.id, row.board_name, row.board_description, row.id_background, row.width, row.height, row.education)
   .catch(error => Toast.show({ type: 'error', text1: 'Error (Ins Local Board)', text2: error.message }))	
}
/*-----------------
   TILES
----------------*/
const GetRemoteTiles = async (db: SQLite.SQLiteDatabase, apiURL: string) => {
  await fetchAndInsertAll<TileType>(db, `${apiURL}/sync/tiles`, InsertLocalTile)
    .catch(error => Toast.show({ type: 'error', text1: 'Error (get Remote tiles)', text2: error.message }));
};
const InsertLocalTile = async (db: SQLite.SQLiteDatabase, row: TileType) => {
   await db.runAsync(`INSERT INTO tiles (id, id_board, num_tile, pos_x, pos_y, tile_type, rotation, radius, border_width, direction) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, row.id, row.id_board, row.num_tile, row.pos_x, row.pos_y, row.tile_type, row.rotation, row.radius, row.border_width, row.direction)
   .catch(error => { 
      //console.log(error.message);
      Toast.show({ type: 'error', text1: 'Error (Ins Local Tile)', text2: error.message }) 
   })	
}
/*-----------------
   SHORTCUTS
----------------*/
const GetRemoteShortcuts = async (db: SQLite.SQLiteDatabase, apiURL: string) => {
  await fetchAndInsertAll<ShortCutType>(db, `${apiURL}/sync/shortcuts`, InsertLocalShortcut)
    .catch(error => Toast.show({ type: 'error', text1: 'Error (get Remote shortcuts)', text2: error.message }));
};
const InsertLocalShortcut = async (db: SQLite.SQLiteDatabase, row: ShortCutType) => {
   await db.runAsync(`INSERT INTO shortcuts (id, id_board, from_tile, to_tile) VALUES (?, ?, ?, ?)`, row.id, row.id_board, row.from_tile, row.to_tile)
   .catch(error => Toast.show({ type: 'error', text1: 'Error', text2: error.message }))	
}
/*-----------------
   TILE TYPES
----------------*/
const GetRemoteTileTypes = async (db: SQLite.SQLiteDatabase, apiURL: string) => {
  await fetchAndInsertAll<EffectType>(db, `${apiURL}/sync/tile-types`, InsertLocalTileType)
    .catch(error => Toast.show({ type: 'error', text1: 'Error (get Remote Tile Types)', text2: error.message }));
};
const InsertLocalTileType = async (db: SQLite.SQLiteDatabase, row: EffectType) => {
   await db.runAsync(`INSERT INTO tile_types (id, effect_name, color_fill, color_border, color_path1, color_path2, path1, path2, paths_x, paths_y, paths_scale) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, row.id, row.effect_name, row.color_fill, row.color_border, row.color_path1, row.color_path2, row.path1, row.path2, row.paths_x, row.paths_y, row.paths_scale)
   .catch(error => Toast.show({ type: 'error', text1: 'Error (Ins Local TileType)', text2: error.message }))	
}
/*-----------------
   DICES
----------------*/
const GetRemoteDices = async (db: SQLite.SQLiteDatabase, apiURL: string) => {
  await fetchAndInsertAll<DiceType>(db, `${apiURL}/sync/dices`, InsertLocalDice)
    .catch(error => Toast.show({ type: 'error', text1: 'Error (get Remote Dices)', text2: error.message }));
};
const InsertLocalDice = async (db: SQLite.SQLiteDatabase, row: DiceType) => {
   await db.runAsync(`INSERT INTO dices (id, dice_name, color_faceup, color_faceleft, color_faceright, color_dots, color_border, border_width, scale) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, row.id, row.dice_name, row.color_faceup, row.color_faceleft, row.color_faceright, row.color_dots, row.color_border, row.border_width, row.scale)
   .catch(error => {
      console.log(`InsDice: ${error.message}`)
      Toast.show({    type: 'error', text1: 'Error (Ins Local Dice)', text2: error.message })
   })	
}
/*-----------------
   EDUCATION
----------------*/
const GetRemoteEducation = async (db: SQLite.SQLiteDatabase, apiURL: string) => {
  await fetchAndInsertAll<EducationType>(db, `${apiURL}/sync/education`, InsertLocalEducation)
    .catch(error => Toast.show({ type: 'error', text1: 'Error (get Remote Education)', text2: error.message }));
};
const InsertLocalEducation = async (db: SQLite.SQLiteDatabase, row: EducationType) => {
   await db.runAsync(`INSERT INTO education (id, generation, theme, information, question, answer_1, answer_2, answer_3, answer_4, answer_ok) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, row.id, row.generation, row.theme, row.information, row.question, row.answer_1, row.answer_2, row.answer_3, row.answer_4, row.answer_ok)
   .catch(error => Toast.show({ type: 'error', text1: 'Error (Ins Local Edu)', text2: error.message }))	
}
/*-----------------------------
   CREACION DE TABLAS LOCALES
------------------------------*/
const DbCreateTables = async (db: SQLite.SQLiteDatabase) => {
   await db.execAsync(`PRAGMA journal_mode = WAL;

      CREATE TABLE IF NOT EXISTS board_backgrounds (
         id INTEGER PRIMARY KEY NOT NULL,
         background_name VARCHAR(30) NOT NULL,
         rect_width SMALLINT NOT NULL,
         rect_height SMALLINT NOT NULL,
         path1 TEXT,
         path2 TEXT,
         color_rect VARCHAR(30) NOT NULL,
         color_path1 VARCHAR(30),
         color_path2 VARCHAR(30)
      );

      CREATE TABLE IF NOT EXISTS boards (
   	   id SMALLINT NOT NULL PRIMARY KEY,
         board_name VARCHAR(30) NOT NULL UNIQUE,
         board_description TEXT,
         id_background SMALLINT NOT NULL,
         width SMALLINT NOT NULL DEFAULT 0,
         height SMALLINT NOT NULL DEFAULT 0,
         education SMALLINT NOT NULL DEFAULT 0
      );
      
      CREATE TABLE IF NOT EXISTS tile_types (
         id TINYINT NOT NULL PRIMARY KEY,
         effect_name  VARCHAR(15) NOT NULL,
         color_fill VARCHAR(30) NOT NULL,
         color_border VARCHAR(30) NOT NULL,
         color_path1 VARCHAR(30) NOT NULL,
         color_path2 VARCHAR(30) NOT NULL,
         path1 TEXT NOT NULL,
         path2 TEXT NOT NULL,
         paths_x SMALLINT NOT NULL,
         paths_y SMALLINT NOT NULL,
         paths_scale DECIMAL(3,1) NOT NULL DEFAULT 1
      );

      CREATE TABLE IF NOT EXISTS tiles (
         id SMALLINT NOT NULL PRIMARY KEY,
         id_board SMALLINT NOT NULL,
         num_tile SMALLINT NOT NULL,
         pos_x SMALLINT  NOT NULL,
         pos_y SMALLINT NOT NULL,
         tile_type TINYINT NOT NULL, 
         rotation SMALLINT NOT NULL,
         radius TINYINT NOT NULL,
         border_width TINYINT NOT NULL,
         direction SMALLINT NOT NULL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS shortcuts (
         id INT NOT NULL PRIMARY KEY,
         id_board SMALLINT NOT NULL,
         from_tile SMALLINT NOT NULL,
         to_tile SMALLINT NOT NULL
      );      

      CREATE TABLE IF NOT EXISTS dices (
         id SMALLINT NOT NULL PRIMARY KEY,
         dice_name VARCHAR(30) NOT NULL UNIQUE,
         color_faceup VARCHAR(30) NOT NULL,
         color_faceleft VARCHAR(30) NOT NULL,
         color_faceright VARCHAR(30) NOT NULL,
         color_dots VARCHAR(30) NOT NULL,
         color_border VARCHAR(30) NOT NULL,
         border_width TINYINT NOT NULL,
         scale  DECIMAL(3,1) NOT NULL DEFAULT 1
      );

      CREATE TABLE IF NOT EXISTS education (
         id INT NOT NULL PRIMARY KEY,
         generation TINYINT, 
         theme TEXT,
         information TEXT,
         question TEXT,
         answer_1 TEXT,
         answer_2 TEXT,
         answer_3 TEXT,
         answer_4 TEXT,
         answer_ok TINYINT
      );`
   )
   .catch(error => {
      Toast.show({ type: 'error', text1: 'Error (create local tables)', text2: error.message })
   });
}

/*-----------------------------
   BORRADO DE TABLAS LOCALES
------------------------------*/
const DbDropTables = async (db: SQLite.SQLiteDatabase) => {
   await db.execAsync(`
      PRAGMA journal_mode = WAL;
      DROP TABLE IF EXISTS board_backgrounds;
      DROP TABLE IF EXISTS boards;
      DROP TABLE IF EXISTS tile_types;
      DROP TABLE IF EXISTS tiles;
      DROP TABLE IF EXISTS shortcuts;      
      DROP TABLE IF EXISTS dices;
      DROP TABLE IF EXISTS education;`
   )
   .catch(error => {
      console.log(error.message)
      Toast.show({ type: 'error', text1: 'Error (drop local tables)', text2: error.message })
   });
}

export {SyncBoardData}
