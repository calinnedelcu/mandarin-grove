# Third-party data notices

The application code and original readings use the project's 0BSD license. The bundled data below keeps its respective upstream license.

| Bundled data                                                        | Source                                                                                                                                               | License files                                                                             |
| ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| HSK-based vocabulary, with curated pronunciation/meaning selections | [complete-hsk-vocabulary](https://github.com/drkameleon/complete-hsk-vocabulary), copyright © 2026 Yanis Zafirópulos                                 | [MIT](HSK-MIT.txt)                                                                        |
| Character definitions, pinyin, radicals and decomposition           | [Make Me a Hanzi dictionary.txt](https://github.com/skishore/makemeahanzi/blob/master/dictionary.txt), derived from Unihan and CJKlib                | [Upstream notice](MakeMeAHanzi-COPYING.txt), [LGPL 3](LGPL-3.0.txt), [GPL 3](GPL-3.0.txt) |
| Character stroke medians                                            | [Make Me a Hanzi graphics.txt](https://github.com/skishore/makemeahanzi/blob/master/graphics.txt), derived from Arphic PL KaitiM GB / Arphic PL UKai | [Upstream notice](MakeMeAHanzi-COPYING.txt), [Arphic Public License](ARPHIC-ARPHICPL.TXT) |

Character data is an unmodified-value subset with omitted fields. The editable JSON data shipped in `src/data/characters.json` is the source form of the bundled subset; the full upstream source remains linked above. Retain these notices and license texts when redistributing the data or application. Provenance and source revisions are in [CONTENT.md](../CONTENT.md).
