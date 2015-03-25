![](slides/requetes_hierarchiques/cours_map.png)

note:
http://ashitani.jp/gv/#

---
#intro
![](slides/requetes_hierarchiques/intro_title.jpg)

---
## Arbre hiérarchique

Les arbres hiérarchiques représentent des structures très courantes en informatique

Une arborescence peut représenter:

- Un organigramme
- Une structure de fichiers
- Une nomenclature
- Un arbre généalogique
- Composition de pièces
- ...

---
## Limites du modèle relationnel

Le modèle relationnel est simple et efficace, mais il n'est pas capable de gérer certaines structures de bases, tel que:

**Les structures hiérarchiques**

<!-- .element: class="center"-->

La représentation d'un « arbre » est simple
mais son parcours posera des difficultés.

<!-- .element: class="comment"-->

---
# Associations réflexives


---
### Représentation d’une structure hiérarchique
![](slides/requetes_hierarchiques/org_plain.png)

---
### Représentation d’une structure hiérarchique
![](slides/requetes_hierarchiques/org_bfs.png)

---
###Recherche des relations parent/enfants

Une auto-jointure externe ne permet de mettre en relation qu’un niveau parent-enfant
  
```sql
SELECT parent.nom AS parent, enfant.nom AS enfant
FROM enfants enfant
LEFT OUTER JOIN enfants parent
ON enfant.parent_id = parent.id;
```
<!-- .element: class="run hidden" data-db="SQLAVANCE" -->

