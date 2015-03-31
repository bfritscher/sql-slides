# expression_de_table_with_(cte)_serie

create table Flight(orig varchar2(3), dest varchar2(3), airline varchar2(10), cost int);
insert into Flight values ('A', 'ORD', 'United', 200);
insert into Flight values ('ORD', 'B', 'American', 100);
insert into Flight values ('A', 'PHX', 'Southwest', 25);
insert into Flight values ('PHX', 'LAS', 'Southwest', 30);
insert into Flight values ('LAS', 'CMH', 'Frontier', 60);
insert into Flight values ('CMH', 'B', 'Frontier', 60);
insert into Flight values ('A', 'B', 'JetBlue', 195);

/*** First find all costs ***/

with recursive
  Route(orig,dest,total) as
    (select orig, dest, cost as total from Flight
     union
     select R.orig, F.dest, cost+total as total
     from Route R, Flight F
     where R.dest = F.orig)
select * from Route
where orig = 'A' and dest = 'B';

/*** Then find minimum; note returns cheapest cost but not route ***/

with recursive
  Route(orig,dest,total) as
    (select orig, dest, cost as total from Flight
     union
     select R.orig, F.dest, cost+total as total
     from Route R, Flight F
     where R.dest = F.orig)
select min(total) from Route
where orig = 'A' and dest = 'B';

/*** Alternative formuation tied specifically to origin 'A' ***/

with recursive
  FromA(dest,total) as
    (select dest, cost as total from Flight where orig = 'A'
     union
     select F.dest, cost+total as total
     from FromA FA, Flight F
     where FA.dest = F.orig)
select * from FromA;

with recursive
  FromA(dest,total) as
    (select dest, cost as total from Flight where orig = 'A'
     union
     select F.dest, cost+total as total
     from FromA FA, Flight F
     where FA.dest = F.orig)
select min(total) from FromA where dest = 'B';

/*** Alternative formuation tied specifically to destination 'B' ***/

with recursive
  ToB(orig,total) as
    (select orig, cost as total from Flight where dest = 'B'
     union
     select F.orig, cost+total as total
     from Flight F, ToB TB
     where F.dest = TB.orig)
select * from ToB;

with recursive
  ToB(orig,total) as
    (select orig, cost as total from Flight where dest = 'B'
     union
     select F.orig, cost+total as total
     from Flight F, ToB TB
     where F.dest = TB.orig)
select min(total) from ToB where orig = 'A';

insert into Flight values ('CMH', 'PHX', 'Frontier', 80);

//something

SELECT libelle fonction, LTRIM(SYS_CONNECT_BY_PATH(code,'->'), '->') chemin
FROM fonctions
CONNECT BY PRIOR numero = num_fonction_mere
START WITH num_fonction_mere IS NULL;

WITH fonctionsDe(numero, num_fonction_mere, libelle, code, niveau, chemin) AS
(SELECT numero, num_fonction_mere, libelle, code, 1 AS niveau, code AS chemin FROM fonctions
WHERE num_fonction_mere IS NULL
UNION ALL 
SELECT fsuivant.numero, fsuivant.num_fonction_mere,
fsuivant.libelle, fsuivant.code, f.niveau + 1, f.chemin || '->' || fsuivant.code
FROM fonctions fsuivant, fonctionsDe f
WHERE f.numero = fsuivant.num_fonction_mere
)
SEARCH DEPTH FIRST BY libelle SET tri_libele
SELECT niveau, LPAD(' ', niveau) || libelle as  libelle, chemin FROM fonctionsDe
ORDER BY tri_libele ASC

## new slide
![](/images/vues/schema.png)


<!-- .element class="smaller" -->
<!-- .element class="small" -->

```sql
CREATE OR REPLACE VIEW v_employes1 AS
  SELECT numero, code, nom, prenom, date_naissance
    FROM employes
   WHERE nom Like 'D%';
```
<!-- .element class="fragment" -->

```sql
SELECT * FROM v_employes1;
```
<!-- .element class="run hide col2 start-hidden" data-db="SQLAVANCE" -->



### 1. sub slide
