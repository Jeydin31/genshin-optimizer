import { applyArtifacts, computeAllStats, createProxiedStats } from "../TestUtils"
import formula from "./data"
import urlon from 'urlon'

const url1 = "https://frzyc.github.io/genshin-optimizer/#/flex?$dbv:2&characterKey=xinyan&levelKey=L80&hitMode=hit&reactionMode:null&artifactConditionals@;&baseStatOverrides$;&weapon$key=SacrificialGreatsword&levelKey=L80A&refineIndex:1&overrideMainVal:0&overrideSubVal:0&conditionalNum:0;&autoInfused:false&talentConditionals@;&constellation:0&artifacts@$level:5&numStars:4&mainStatKey=hp&setKey=Instructor&slotKey=flower&substats$def_:5.8&hp_:4.2&def:17&enerRech_:4.1;;&$level:6&numStars:4&mainStatKey=atk&setKey=Instructor&slotKey=plume&substats$hp:239&def:13&eleMas:13&:0;;&$level:4&numStars:4&mainStatKey=def_&setKey=WanderersTroupe&slotKey=sands&substats$eleMas:17&critDMG_:5.6&critRate_:2.8&atk_:4.7;;&$level:5&numStars:4&mainStatKey=def_&setKey=Instructor&slotKey=goblet&substats$atk_:3.7&hp_:3.7&eleMas:15&:0;;&$level:6&numStars:4&mainStatKey=def_&setKey=Instructor&slotKey=circlet&substats$atk:16&atk_:3.7&hp:215&:0;;;&tlvl@:0&:0&:0"
const charObj1 = urlon.parse(url1.split("flex?")[1])
charObj1.artifacts.forEach(art => delete art.substats[""]);//remove empty substats

let setupStats
describe("Testing Xinyan's Formulas (⛧ Sin ⛧#0663)", () => {
  beforeEach(() => {
    setupStats = createProxiedStats({
      characterHP: 9927, characterATK: 220, characterDEF: 708,
      characterEle: "pyro", characterLevel: 80,
      weaponType: "claymore", weaponATK: 523,
      enerRech_: 27.9,//Sacrificial greatsword R2
      atk_: 18,//specialized

      enemyLevel: 82, physical_enemyRes_: 70, // Ruin Guard
      tlvl: Object.freeze({ auto: 6 - 1, skill: 10 - 1, burst: 9 - 1 }),
    })
  })

  describe("with artifacts", () => {
    beforeEach(() => applyArtifacts(setupStats, [
      { hp: 1599, ...charObj1.artifacts[0].substats }, // Flower of Life
      { atk: 113, ...charObj1.artifacts[1].substats }, // Plume of Death
      { def_: 16.8, ...charObj1.artifacts[2].substats }, // Sands of Eon
      { def_: 19, ...charObj1.artifacts[3].substats }, // Goblet of Eonothem
      { def_: 21.2, ...charObj1.artifacts[4].substats }, // Circlet of Logos
      { eleMas: 80 }, // 4 piece Instructor
    ]))

    describe("no crit", () => {
      beforeEach(() => setupStats.hitMode = "hit")

      test("hit", () => {
        const stats = computeAllStats(setupStats)
        expect(formula.normal[0](stats)[0](stats)).toApproximate(181)
        expect(formula.normal[1](stats)[0](stats)).toApproximate(175)
        expect(formula.normal[2](stats)[0](stats)).toApproximate(226)
        expect(formula.normal[3](stats)[0](stats)).toApproximate(275)
        expect(formula.charged.spinningDEF(stats)[0](stats)).toApproximate(228)
        expect(formula.charged.finalDEF(stats)[0](stats)).toApproximate(413)
        // expect(formula.plunging.dmg(stats)[0](stats)).toApproximate()
        // expect(formula.plunging.low(stats)[0](stats)).toApproximate()
        expect(formula.plunging.high(stats)[0](stats)).toApproximate(442)

        expect(formula.skill.dmg(stats)[0](stats)).toApproximate(1496)

        expect(formula.burst.dot(stats)[0](stats)).toApproximate(333)


        //reactions
        // expect(stats.overloaded_hit).toApproximate(1496) //invalid?
        expect(stats.shattered_hit).toApproximate(657)

      })

    })
    describe("crit", () => {
      beforeEach(() => setupStats.hitMode = "critHit")

      test("hit", () => {
        const stats = computeAllStats(setupStats)
        expect(formula.normal[0](stats)[0](stats)).toApproximate(282)
        expect(formula.normal[1](stats)[0](stats)).toApproximate(273)
        expect(formula.normal[2](stats)[0](stats)).toApproximate(352)
        expect(formula.normal[3](stats)[0](stats)).toApproximate(428)
        expect(formula.charged.spinningDEF(stats)[0](stats)).toApproximate(355)
        expect(formula.charged.finalDEF(stats)[0](stats)).toApproximate(643)
        // expect(formula.plunging.dmg(stats)[0](stats)).toApproximate(688)
        // expect(formula.plunging.low(stats)[0](stats)).toApproximate(688)
        expect(formula.plunging.high(stats)[0](stats)).toApproximate(688)

        expect(formula.skill.dmg(stats)[0](stats)).toApproximate(2328)

        expect(formula.burst.dmg(stats)[0](stats)).toApproximate(1472)
        expect(formula.burst.dot(stats)[0](stats)).toApproximate(518)
      })
    })
  })
})
