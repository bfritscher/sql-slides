SELECT LEVEL niveau,
       code, 
       libelle fonction 
FROM fonctions
WHERE LEVEL = (SELECT LEVEL
                 FROM fonctions
                WHERE code = 'CTR'
               CONNECT BY PRIOR numero = num_fonction_mere
                 START WITH num_fonction_mere IS NULL)
CONNECT BY PRIOR numero = num_fonction_mere
START WITH num_fonction_mere IS NULL;

WITH arbre AS (
  SELECT LEVEL AS niveau, code, libelle AS fonction 
    FROM fonctions
  CONNECT BY PRIOR numero = num_fonction_mere
  START WITH num_fonction_mere IS NULL
)
SELECT *
FROM arbre
WHERE niveau = (SELECT niveau FROM arbre WHERE code = 'CTR');

