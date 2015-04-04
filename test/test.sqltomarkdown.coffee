expect = chai.expect

describe 'SQLtoMarkdown', ->
    it 'should load', ->
        expect(SQLtoMarkdown).to.exist
    it 'should return empty on wrong input', ->
        expect(SQLtoMarkdown.parse()).to.equal('')
    it 'no data', ->
        expect(SQLtoMarkdown.parse({headers:[],content:[]})).to.equal('')
    it 'only header', ->
        expect(SQLtoMarkdown.parse({headers:['a','b'],content:[]})).to.equal('| a | b | \n|---|---| \n')
    it 'only content, should have an empty header to be valid', ->
        expect(SQLtoMarkdown.parse({headers:[],content:[['a','b']]})).to.equal('|   |   | \n|---|---| \n| a | b | \n')
    it 'should return a valid markdown table with headers', ->
        expect(SQLtoMarkdown.parse({headers:['ha','hb'],content:[['a','b'],['c','d']]}))
        .to.equal('| ha | hb | \n|----|----| \n| a  | b  | \n| c  | d  | \n')
    it 'should limit number of rows to provided limit', ->
        expect(SQLtoMarkdown.parse({headers:['ha','hb'],content:[['a','b'],['c','d'],['e','f']]}, 2))
        .to.equal('| ha | hb | \n|----|----| \n| a  | b  | \n| ... | ... | \n')