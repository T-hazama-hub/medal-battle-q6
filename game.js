(() => {
  "use strict";

  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");
  const APP_VERSION = "2026.07.10-q6";
  const DEBUG_D_CS = true;
  const DEBUG_TRACE = true;
  const DEBUG_TRACE_LIMIT = 240;
  const phaseText = document.getElementById("phaseText");
  const appVersion = document.getElementById("appVersion");
  const activeStats = document.getElementById("activeStats");
  const battleLog = document.getElementById("battleLog");
  const resetButton = document.getElementById("resetButton");
  const csGaugeFill = document.getElementById("csGaugeFill");
  const csGaugeText = document.getElementById("csGaugeText");
  const partyCards = document.getElementById("partyCards");
  const partyDetail = document.getElementById("partyDetail");
  const csStandbyInfo = document.getElementById("csStandbyInfo");

  if (appVersion) appVersion.textContent = `v${APP_VERSION}`;

  const field = {
    width: canvas.width,
    height: canvas.height,
    padding: 34,
  };

  const DECEL_SECONDS = 0.5;
  const RUSH_BLOWAWAY_DECEL_SECONDS = DECEL_SECONDS;
  const MIN_REMOTE_POINTER_TRAVEL = 22;
  const DEFAULT_MOVE_SPEED = 800;
  const BUMP_STOP_SECONDS = 0.4;
  const DEFEAT_EFFECT_SECONDS = 0.78;
  const POST_DEFEAT_PAUSE_SECONDS = 0.3;
  const IMPACT_EFFECT_SECONDS = 0.34;
  const DAMAGE_NUMBER_SECONDS = 2;
  const DAMAGE_NUMBER_STACK_MAX = 10;
  const DAMAGE_NUMBER_STACK_STEP = 37;
  const SMASH_EFFECT_SECONDS = 0.5;
  const COMMAND_SKILL_EFFECT_SECONDS = 1.35;
  const BOMB_CLICK_EFFECT_SECONDS = 0.45;
  const BOMB_EXPLOSION_DELAY = 0.4;
  const POINT_BOMB_ARM_SECONDS = 0.5;
  const BOMB_EXPLOSION_SECONDS = 1.12;
  const BOMB_EXPLOSION_HIT_START = 0.22;
  const BOMB_EXPLOSION_HIT_INTERVAL = 0.055;
  const WALL_TRAP_EFFECT_SECONDS = 0.56;
  const WALL_TRAP_HIT_STOP_SECONDS = 0.2;
  const WALL_TRAP_RETRIGGER_COOLDOWN_SECONDS = 0.25;
  const CONTACT_RETRIGGER_COOLDOWN_SECONDS = 0.25;
  const WALL_TRAP_HIT_START = 0;
  const WALL_TRAP_HIT_INTERVAL = 0;
  const CONFUSION_WALL_HIT_START = 0.3;
  const CONFUSION_WALL_HIT_INTERVAL = 0.03;
  const CONFUSION_WALL_EFFECT_TAIL = 0.35;
  const CONFUSION_WALL_WAVE_COUNT = 15;
  const CONFUSION_WALL_KNOCKBACK_SPEED = 2800;
  const CONFUSION_WALL_KNOCKBACK_SECONDS = 0.9;
  const WALL_TRAP_NUDGE_DELAY = 0.1;
  const WALL_TRAP_NUDGE_DISTANCE = 8;
  const DODGE_EFFECT_SECONDS = 0.36;
  const ONE_MORE_EFFECT_SECONDS = 1.0;
  const NEXT_TURN_EFFECT_SECONDS = 1.05;
  const REINFORCEMENT_SPAWN_SECONDS = 1.18;
  const REINFORCEMENT_LINGER_SECONDS = 0.5;
  const ROUND_BANNER_SECONDS = 1.22;
  const ROUND_CLEAR_SECONDS = 1.25;
  const ROUND_TRANSITION_SECONDS = 0.9;
  const QUEST_WIN_SECONDS = 1.95;
  const REINFORCEMENT_EFFECT_SECONDS = REINFORCEMENT_SPAWN_SECONDS + REINFORCEMENT_LINGER_SECONDS;
  const RUSH_HIT_WINDUP_SECONDS = 0.7;
  const RUSH_HIT_INTERVAL = 0.035;
  const RUSH_EFFECT_TAIL_SECONDS = 0.32;
  const RUSH_DOGO_STEP_SECONDS = 0.16;
  const RUSH_DOGO_DURATION_SECONDS = 0.3;
  const TIME_STOP_ENTER_SECONDS = 0.72;
  const TIME_STOP_RELEASE_SECONDS = 1.35;
  const TIME_STOP_MOVE_MULTIPLIER = 6;
  const TIME_STOP_ATTACK_MULTIPLIER = 2;
  const MAX_IMPACT_PARTICLES = 140;
  const MAX_DAMAGE_NUMBERS = 80;
  const IMPACT_SPARK_SIZE_SCALE = 2;
  const ENEMY_WARNING_SECONDS = 2;
  const ENEMY_ARROW_SECONDS = 1.5;
  const DEFAULT_ALLY_MASS = 10;
  const DEFAULT_ENEMY_MASS = 15;
  const DEFAULT_ALLY_SIZE = 80;
  const DEFAULT_ENEMY_SIZE = 130;
  const MIN_LAUNCH_PULL_DISTANCE = DEFAULT_ALLY_SIZE;
  const LAUNCH_ARROW_START_LENGTH = 28;
  const LAUNCH_ARROW_GROWTH = 2.4;
  const MAX_LAUNCH_ARROW_LENGTH = 380;
  const AXIS_ALIGNED_ARROW_PIXEL_EPSILON = 0.5;
  const WALL_BOUNCE_MIN_SPEED = 220;
  const WALL_PINCH_MARGIN = 10;
  const WALL_PINCH_TARGET_POP_SPEED = 330;
  const WALL_PINCH_TANGENT_CARRY = 0.34;
  const WALL_PINCH_CONTACT_BLEND = 0.72;
  const TEST_INITIAL_CS = 100;
  const ENEMY_COUNT_MAX = 9;
  const ALLY_DEFEAT_CS_GAIN = 20;
  const BOMB_DODGE_HANDS = 4;
  const BOMB_COUNT_DELAY = 2;
  const COMMAND_SKILL_RANGES = {
    circleSmall: { label: "円形小型", radius: 140 },
    circleMedium: { label: "円形中型", radius: 260 },
    circleLarge: { label: "円形大型", radius: 400 },
  };

  const defaultStats = {
    hp: 100,
    attack: 18,
    defense: 4,
    moveSpeed: DEFAULT_MOVE_SPEED,
    moveDistance: 1800,
    range: 150,
    smashDamage: 1.5,
    commandSkillType: "all",
    commandSkillCost: 100,
    commandSkillDamage: 5,
    commandSkillName: "仮CS・閃光衝撃波",
    commandSkillAreaLabel: COMMAND_SKILL_RANGES.circleLarge.label,
    commandSkillBombRadius: COMMAND_SKILL_RANGES.circleLarge.radius,
    commandSkillBombHits: 10,
    commandSkillBombDodgeHands: BOMB_DODGE_HANDS,
    commandSkillBombCountDelay: BOMB_COUNT_DELAY,
    commandSkillCsGainPerDefeat: 0,
    commandSkillDefenseIgnore: false,
    commandSkillRushHits: 20,
    commandSkillRushDamage: 0.2,
    commandSkillFinishHits: 5,
    commandSkillFinishDamage: 2,
    commandSkillMoveBoost: 5,
    commandSkillAttackAdd: 1,
    commandSkillAuraRadius: COMMAND_SKILL_RANGES.circleSmall.radius,
    commandSkillConfusionTurns: 2,
    commandSkillWallTrapTurns: 2,
    commandSkillWallTrapHits: 10,
    commandSkillWallTrapDamage: 0.1,
    commandSkillWallTrapRadius: COMMAND_SKILL_RANGES.circleSmall.radius,
    commandSkillWallTrapAreaLabel: COMMAND_SKILL_RANGES.circleSmall.label,
    commandSkillWallTrapDefenseIgnore: true,
    commandSkillWaveCount: CONFUSION_WALL_WAVE_COUNT,
  };

  const battle = {
    medals: [],
    activeId: null,
    phase: "ally",
    round: 1,
    hand: 0,
    actedThisRound: new Set(),
    dragging: false,
    dragStart: null,
    dragNow: null,
    dragPointerStart: null,
    dragPointerNow: null,
    dragPointerId: null,
    dragRemote: false,
    dragPickedId: null,
    dragOutsideField: false,
    movingMedal: null,
    lastTime: performance.now(),
    csGauge: 0,
    collisionMemory: new Map(),
    contactLocks: new Map(),
    defeatEffect: null,
    postDefeatPause: null,
    impactEffects: [],
    impactCooldowns: new Map(),
    dogoEffects: [],
    damageNumbers: [],
    smashEffect: null,
    postSmashContactActorId: null,
    commandSkillEffect: null,
    commandSkillTargeting: null,
    bomb: null,
    bombClickEffect: null,
    bombExplosionEffect: null,
    wallTrapEffects: [],
    wallTrapHitStop: 0,
    wallTrap: null,
    wallTrapNudges: [],
    wallTrapCooldowns: new Map(),
    rushEffect: null,
    rushBlowaway: null,
    timeStop: null,
    timeStopEffect: null,
    dodgeEffects: [],
    dodgeCooldowns: new Map(),
    reinforcementEffect: null,
    roundBannerEffect: null,
    roundTransitionEffect: null,
    commandSkillStandbyId: null,
    commandSkillArmedId: null,
    enemyQueue: [],
    enemyAction: null,
    inspectedAllyId: null,
    detailOpen: false,
    comboCount: 0,
    comboDisplayCount: 0,
    comboAnimation: null,
    pendingActionContext: null,
    debugTrace: [],
    oneMoreActive: false,
    oneMoreAllyId: null,
    oneMoreDefeatsThisAction: new Set(),
    oneMoreEffect: null,
    nextTurnEffect: null,
    enemySpawnCounter: 0,
    questRoundIndex: 0,
    questWaveIndex: -1,
    questEnemyOrdinal: 0,
    questComplete: false,
    log: [],
  };

  const enemySpawnSlots = [
    { x: 160, y: 210 },
    { x: 360, y: 170 },
    { x: 560, y: 240 },
    { x: 250, y: 320 },
    { x: 470, y: 340 },
  ];

  const allySeed = [
    { team: "ally", label: "A", x: 120, y: 690, stats: { hp: 120, attack: 24, defense: 0, moveDistance: 1900, commandSkillType: "all", commandSkillCost: 50, commandSkillDamage: 5, commandSkillName: "閃光衝撃波" } },
    { team: "ally", label: "B", x: 240, y: 780, stats: { hp: 100, attack: 20, defense: 0, moveDistance: 1700, commandSkillType: "bomb", commandSkillCost: 50, commandSkillDamage: 1, commandSkillName: "設置爆弾", commandSkillAreaLabel: COMMAND_SKILL_RANGES.circleLarge.label, commandSkillBombRadius: COMMAND_SKILL_RANGES.circleLarge.radius, commandSkillBombHits: 10 } },
    { team: "ally", label: "C", x: 360, y: 690, stats: { hp: 140, attack: 18, defense: 0, moveDistance: 1850, commandSkillType: "point-bomb", commandSkillCost: 25, commandSkillDamage: 10, commandSkillName: "地点爆破", commandSkillAreaLabel: COMMAND_SKILL_RANGES.circleSmall.label, commandSkillBombRadius: COMMAND_SKILL_RANGES.circleSmall.radius, commandSkillBombHits: 1, commandSkillBombCountDelay: 1, commandSkillCsGainPerDefeat: 10, commandSkillDefenseIgnore: true } },
    { team: "ally", label: "D", x: 480, y: 780, stats: { hp: 110, attack: 22, defense: 0, moveDistance: 1750, commandSkillType: "rush-time-stop", commandSkillCost: 100, commandSkillName: "時止め連打", commandSkillDamage: 0.2, commandSkillRushDamage: 0.2, commandSkillRushHits: 20, commandSkillDefenseIgnore: true, commandSkillFinishDamage: 2, commandSkillFinishHits: 5, commandSkillMoveBoost: 5, commandSkillAttackAdd: 1, commandSkillAuraRadius: COMMAND_SKILL_RANGES.circleSmall.radius } },
    { team: "ally", label: "E", x: 600, y: 690, stats: { hp: 130, attack: 16, defense: 0, moveDistance: 1650, commandSkillType: "confusion-wall", commandSkillCost: 60, commandSkillName: "混乱壁縛り", commandSkillDamage: 0.1, commandSkillBombHits: 50, commandSkillAreaLabel: COMMAND_SKILL_RANGES.circleMedium.label, commandSkillBombRadius: COMMAND_SKILL_RANGES.circleMedium.radius, commandSkillConfusionTurns: 2, commandSkillWallTrapTurns: 2, commandSkillWallTrapHits: 10, commandSkillWallTrapDamage: 0.1, commandSkillWallTrapRadius: COMMAND_SKILL_RANGES.circleSmall.radius, commandSkillWallTrapAreaLabel: COMMAND_SKILL_RANGES.circleSmall.label, commandSkillWallTrapDefenseIgnore: true, commandSkillWaveCount: 15 } },
  ];

  const questRounds = [
    {
      title: "Round 1",
      refillToActive: 3,
      waves: [
        [
          { label: "A", x: 180, y: 260, stats: { hp: 62, attack: 16, defense: 3, moveDistance: 1400, initialCount: 3, testRole: "mob" } },
          { label: "B", x: 360, y: 190, stats: { hp: 500, attack: 18, defense: 6, moveDistance: 1400, initialCount: 2, testRole: "boss" } },
          { label: "C", x: 545, y: 280, stats: { hp: 54, attack: 17, defense: 2, moveDistance: 1400, initialCount: 1, testRole: "mob" } },
        ],
        [{ label: "D", stats: { hp: 76, attack: 17, defense: 3, moveDistance: 1450, initialCount: 2, testRole: "mob" } }],
        [{ label: "E", stats: { hp: 82, attack: 18, defense: 4, moveDistance: 1450, initialCount: 3, testRole: "mob" } }],
        [{ label: "F", stats: { hp: 70, attack: 16, defense: 2, moveDistance: 1500, initialCount: 1, testRole: "mob" } }],
        [{ label: "G", stats: { hp: 88, attack: 19, defense: 4, moveDistance: 1500, initialCount: 2, testRole: "mob" } }],
      ],
    },
    {
      title: "Round 2",
      waves: [
        [{ label: "G", x: 360, y: 210, stats: { hp: 130, attack: 20, defense: 5, moveDistance: 1500, initialCount: 1, testRole: "mob" } }],
        [{ label: "H", x: 250, y: 300, stats: { hp: 150, attack: 19, defense: 4, moveDistance: 1550, initialCount: 2, testRole: "mob" } }],
        [{ label: "I", x: 500, y: 300, stats: { hp: 170, attack: 21, defense: 5, moveDistance: 1600, initialCount: 1, testRole: "mob" } }],
      ],
    },
    {
      title: "Final Round",
      final: true,
      waves: [
        [
          { label: "J", x: 285, y: 225, stats: { hp: 420, attack: 22, defense: 6, moveDistance: 1500, initialCount: 2, testRole: "boss", size: 150, mass: 18 } },
          { label: "K", x: 455, y: 225, stats: { hp: 760, attack: 24, defense: 8, moveDistance: 1500, initialCount: 3, testRole: "boss", size: 165, mass: 22 } },
        ],
        [
          { label: "L", x: 150, y: 235, stats: { hp: 96, attack: 18, defense: 3, moveDistance: 1450, initialCount: 1, testRole: "mob" } },
          { label: "M", x: 295, y: 175, stats: { hp: 120, attack: 19, defense: 4, moveDistance: 1450, initialCount: 2, testRole: "mob" } },
          { label: "N", x: 430, y: 180, stats: { hp: 130, attack: 20, defense: 4, moveDistance: 1450, initialCount: 2, testRole: "mob" } },
          { label: "O", x: 560, y: 255, stats: { hp: 110, attack: 18, defense: 3, moveDistance: 1500, initialCount: 1, testRole: "mob" } },
          { label: "P", x: 360, y: 335, stats: { hp: 180, attack: 21, defense: 5, moveDistance: 1550, initialCount: 3, testRole: "boss" } },
        ],
      ],
    },
  ];

  function makeMedal(seed, index) {
    const teamMass = seed.team === "enemy" ? DEFAULT_ENEMY_MASS : DEFAULT_ALLY_MASS;
    const teamSize = seed.team === "enemy" ? DEFAULT_ENEMY_SIZE : DEFAULT_ALLY_SIZE;
    const stats = { ...defaultStats, mass: teamMass, size: teamSize, ...seed.stats };
    return {
      id: `${seed.team}-${index}`,
      label: seed.label ?? `${index + 1}`,
      team: seed.team,
      x: seed.x,
      y: seed.y,
      vx: 0,
      vy: 0,
      radius: stats.size / 2,
      maxHp: stats.hp,
      hp: stats.hp,
      attack: stats.attack,
      attackModifier: 1,
      defense: stats.defense,
      moveSpeed: stats.moveSpeed,
      moveDistance: stats.moveDistance,
      range: stats.range,
      smashDamage: stats.smashDamage,
      commandSkillType: stats.commandSkillType,
      commandSkillCost: stats.commandSkillCost,
      commandSkillDamage: stats.commandSkillDamage,
      commandSkillName: stats.commandSkillName,
      commandSkillAreaLabel: stats.commandSkillAreaLabel,
      commandSkillBombRadius: stats.commandSkillBombRadius,
      commandSkillBombHits: stats.commandSkillBombHits,
      commandSkillBombDodgeHands: stats.commandSkillBombDodgeHands,
      commandSkillBombCountDelay: stats.commandSkillBombCountDelay,
      commandSkillCsGainPerDefeat: stats.commandSkillCsGainPerDefeat,
      commandSkillDefenseIgnore: stats.commandSkillDefenseIgnore,
      commandSkillRushHits: stats.commandSkillRushHits,
      commandSkillRushDamage: stats.commandSkillRushDamage,
      commandSkillFinishHits: stats.commandSkillFinishHits,
      commandSkillFinishDamage: stats.commandSkillFinishDamage,
      commandSkillMoveBoost: stats.commandSkillMoveBoost,
      commandSkillAttackAdd: stats.commandSkillAttackAdd,
      commandSkillAuraRadius: stats.commandSkillAuraRadius,
      commandSkillConfusionTurns: stats.commandSkillConfusionTurns,
      commandSkillWallTrapTurns: stats.commandSkillWallTrapTurns,
      commandSkillWallTrapHits: stats.commandSkillWallTrapHits,
      commandSkillWallTrapDamage: stats.commandSkillWallTrapDamage,
      commandSkillWallTrapRadius: stats.commandSkillWallTrapRadius,
      commandSkillWallTrapAreaLabel: stats.commandSkillWallTrapAreaLabel,
      commandSkillWallTrapDefenseIgnore: stats.commandSkillWallTrapDefenseIgnore,
      commandSkillWaveCount: stats.commandSkillWaveCount,
      size: stats.size,
      mass: stats.mass,
      testRole: seed.team === "enemy" ? stats.testRole ?? (stats.hp >= 1000 ? "boss" : "mob") : null,
      initialCount: seed.team === "enemy" ? stats.initialCount ?? 3 : null,
      count: seed.team === "enemy" ? stats.initialCount ?? 3 : null,
      defeatPending: false,
      removed: false,
      confusionTurns: 0,
      moving: false,
      activeShot: false,
      bumpMoving: false,
      rushBlowaway: false,
      rushDecelerating: false,
      rushDecelElapsed: 0,
      bumpStartVx: 0,
      bumpStartVy: 0,
      remainingDistance: 0,
      decelDistance: 0,
      shotElapsed: 0,
      constantTravelTime: 0,
      decelDuration: DECEL_SECONDS,
      bumpElapsed: 0,
      bumpDuration: BUMP_STOP_SECONDS,
      currentSpeed: 0,
    };
  }

  function resetBattle() {
    battle.medals = allySeed.map(makeMedal);
    battle.activeId = null;
    battle.phase = "ally";
    battle.round = 1;
    battle.hand = 0;
    battle.actedThisRound = new Set();
    battle.dragging = false;
    battle.dragStart = null;
    battle.dragNow = null;
    battle.dragPointerStart = null;
    battle.dragPointerNow = null;
    battle.dragPointerId = null;
    battle.dragRemote = false;
    battle.dragPickedId = null;
    battle.dragOutsideField = false;
    battle.movingMedal = null;
    battle.csGauge = TEST_INITIAL_CS;
    battle.collisionMemory.clear();
    battle.contactLocks.clear();
    battle.defeatEffect = null;
    battle.postDefeatPause = null;
    battle.impactEffects = [];
    battle.impactCooldowns.clear();
    battle.dogoEffects = [];
    battle.damageNumbers = [];
    battle.smashEffect = null;
    battle.postSmashContactActorId = null;
    battle.commandSkillEffect = null;
    battle.commandSkillTargeting = null;
    battle.bomb = null;
    battle.bombClickEffect = null;
    battle.bombExplosionEffect = null;
    battle.wallTrapEffects = [];
    battle.wallTrapHitStop = 0;
    battle.wallTrap = null;
    battle.wallTrapNudges = [];
    battle.wallTrapCooldowns.clear();
    battle.rushEffect = null;
    battle.rushBlowaway = null;
    battle.timeStop = null;
    battle.timeStopEffect = null;
    battle.dodgeEffects = [];
    battle.dodgeCooldowns.clear();
    battle.reinforcementEffect = null;
    battle.roundBannerEffect = null;
    battle.roundTransitionEffect = null;
    battle.commandSkillStandbyId = null;
    battle.commandSkillArmedId = null;
    battle.enemyQueue = [];
    battle.enemyAction = null;
    battle.inspectedAllyId = null;
    battle.detailOpen = false;
    resetCombo();
    battle.pendingActionContext = null;
    battle.oneMoreActive = false;
    battle.oneMoreAllyId = null;
    battle.oneMoreDefeatsThisAction = new Set();
    battle.oneMoreEffect = null;
    battle.nextTurnEffect = null;
    battle.enemySpawnCounter = 0;
    battle.questRoundIndex = 0;
    battle.questWaveIndex = -1;
    battle.questEnemyOrdinal = 0;
    battle.questComplete = false;
    battle.debugTrace = [];
    battle.log = [];
    addLog("クエスト開始");
    startQuestRound(0);
    updateHud();
  }

  function addLog(message) {
    battle.log.unshift(message);
    battle.log = battle.log.slice(0, 40);
    battleLog.innerHTML = "";
    for (const item of battle.log) {
      const li = document.createElement("li");
      li.textContent = item;
      battleLog.appendChild(li);
    }
  }

  function debugD(message, data = {}) {
    if (!DEBUG_D_CS) return;
    const details = Object.entries(data)
      .filter(([, value]) => value !== undefined && value !== null)
      .map(([key, value]) => {
        if (typeof value === "number") return `${key}:${Math.round(value * 100) / 100}`;
        if (typeof value === "boolean") return `${key}:${value ? "Y" : "N"}`;
        return `${key}:${value}`;
      })
      .join(" ");
    const line = `DBG D ${message}${details ? ` ${details}` : ""}`;
    addLog(line);
    console.debug(`[DCS ${APP_VERSION}] ${message}`, data);
  }

  function compactDebugValue(value) {
    if (typeof value === "number") return Math.round(value * 100) / 100;
    if (typeof value === "boolean" || typeof value === "string" || value === null || value === undefined) return value;
    if (Array.isArray(value)) return value.map(compactDebugValue);
    if (typeof value === "object") {
      const compact = {};
      for (const [key, item] of Object.entries(value)) compact[key] = compactDebugValue(item);
      return compact;
    }
    return String(value);
  }

  function debugSnapshot() {
    const moving = battle.movingMedal;
    return {
      phase: battle.phase,
      moving: moving ? `${moving.id}:${moving.team}:hp${Math.ceil(moving.hp)}:dp${moving.defeatPending ? 1 : 0}:mv${moving.moving ? 1 : 0}` : "none",
      pending: battle.pendingActionContext ? `${battle.pendingActionContext.actedId}:${battle.pendingActionContext.actedTeam}` : "none",
      enemyAction: battle.enemyAction ? `${battle.enemyAction.enemyId}:${battle.enemyAction.stage}` : "none",
      bomb: battle.bombExplosionEffect ? `${battle.bombExplosionEffect.kind ?? "bomb"}:${battle.bombExplosionEffect.appliedHits}/${battle.bombExplosionEffect.hits}` : "none",
      defeat: battle.defeatEffect ? `${battle.defeatEffect.mode}:${battle.defeatEffect.medals.map((m) => m.id).join(",")}` : "none",
      postDefeat: battle.postDefeatPause ? "Y" : "N",
      enemyQueue: battle.enemyQueue.join(",") || "none",
      livingEnemies: living("enemy").map((enemy) => `${enemy.id}:${Math.ceil(enemy.hp)}:${enemy.count}`).join("|") || "none",
      pendingDefeats: pendingDefeatedMedals().map((enemy) => enemy.id).join(",") || "none",
    };
  }

  function traceEvent(event, data = {}, options = {}) {
    if (!DEBUG_TRACE) return;
    const entry = {
      t: Math.round(performance.now()),
      event,
      ...debugSnapshot(),
      data: compactDebugValue(data),
    };
    battle.debugTrace.push(entry);
    if (battle.debugTrace.length > DEBUG_TRACE_LIMIT) battle.debugTrace.splice(0, battle.debugTrace.length - DEBUG_TRACE_LIMIT);
    window.medalDebugTrace = battle.debugTrace;
    window.medalDebugTraceText = () => battle.debugTrace.map((item) => JSON.stringify(item)).join("\n");
    window.clearMedalDebugTrace = () => {
      battle.debugTrace = [];
      window.medalDebugTrace = battle.debugTrace;
      try { localStorage.removeItem("medalBattleDebugTrace"); } catch (_error) { /* ignore storage errors */ }
    };
    try { localStorage.setItem("medalBattleDebugTrace", window.medalDebugTraceText()); } catch (_error) { /* ignore storage errors */ }
    console.debug(`[TRACE ${APP_VERSION}] ${event}`, entry);
    if (options.visible) {
      const detailText = Object.entries(data)
        .map(([key, value]) => `${key}:${compactDebugValue(value)}`)
        .join(" ");
      addLog(`TRC ${event}${detailText ? ` ${detailText}` : ""}`);
    }
  }

  function isBlockingBombExplosionEffect(effect = battle.bombExplosionEffect) {
    if (!effect) return false;
    return !(effect.kind === "wall-trap" && effect.damageComplete);
  }

  function living(team) {
    return battle.medals.filter((m) => !m.removed && m.team === team && m.hp > 0);
  }

  function isOnBoard(medal) {
    return !medal.removed && (medal.hp > 0 || medal.defeatPending);
  }

  function pendingDefeatedMedals() {
    return battle.medals.filter((m) => !m.removed && m.defeatPending);
  }

  function currentQuestRound() {
    return questRounds[battle.questRoundIndex] ?? questRounds[0];
  }

  function isFinalQuestRound() {
    return Boolean(currentQuestRound()?.final || battle.questRoundIndex >= questRounds.length - 1);
  }

  function remainingReinforcementCount() {
    const round = currentQuestRound();
    if (!round) return 0;
    return round.waves
      .slice(Math.max(0, battle.questWaveIndex + 1))
      .reduce((sum, wave) => sum + wave.length, 0);
  }

  function questRoundHudLabel() {
    return isFinalQuestRound() ? "Final" : `Round ${battle.questRoundIndex + 1}`;
  }

  function resetAllyPositions() {
    const seedsByLabel = new Map(allySeed.map((seed) => [seed.label, seed]));
    for (const ally of battle.medals.filter((medal) => medal.team === "ally")) {
      const seed = seedsByLabel.get(ally.label);
      if (!seed) continue;
      ally.x = seed.x;
      ally.y = seed.y;
      ally.vx = 0;
      ally.vy = 0;
      ally.moving = false;
      ally.activeShot = false;
      ally.bumpMoving = false;
      ally.rushBlowaway = false;
      ally.rushDecelerating = false;
      ally.bumpElapsed = 0;
      ally.shotElapsed = 0;
      ally.remainingDistance = 0;
      keepMedalInsideField(ally, false);
    }
    battle.collisionMemory.clear();
    battle.contactLocks.clear();
  }

  function reinforcementSpawnScore(enemy, x, y, extraMedals = []) {
    const others = battle.medals
      .filter((medal) => medal !== enemy && isOnBoard(medal))
      .concat(extraMedals.filter((medal) => medal !== enemy && isOnBoard(medal)));
    if (others.length === 0) return Infinity;
    let score = Infinity;
    for (const other of others) {
      const clearance = Math.hypot(x - other.x, y - other.y) - (enemy.radius + other.radius + 14);
      score = Math.min(score, clearance);
    }
    return score;
  }

  function chooseReinforcementPosition(enemy, extraMedals = []) {
    const minX = field.padding + enemy.radius;
    const maxX = field.width - field.padding - enemy.radius;
    const minY = field.padding + enemy.radius;
    const maxY = field.height - field.padding - enemy.radius;
    const clampX = (x) => Math.max(minX, Math.min(maxX, x));
    const clampY = (y) => Math.max(minY, Math.min(maxY, y));
    const candidates = enemySpawnSlots.map((slot) => ({ x: clampX(slot.x), y: clampY(slot.y) }));
    for (let i = 0; i < 80; i += 1) {
      candidates.push({
        x: minX + Math.random() * (maxX - minX),
        y: minY + Math.random() * (maxY - minY),
      });
    }

    let best = candidates[0];
    let bestScore = -Infinity;
    for (const candidate of candidates) {
      const score = reinforcementSpawnScore(enemy, candidate.x, candidate.y, extraMedals);
      if (score > bestScore) {
        best = candidate;
        bestScore = score;
      }
      if (score >= enemy.radius * 0.75) break;
    }
    return best;
  }

  function makeQuestEnemy(template, waveIndex, slotIndex) {
    const spawnNumber = battle.questEnemyOrdinal;
    const slot = enemySpawnSlots[slotIndex % enemySpawnSlots.length];
    const enemy = makeMedal(
      {
        team: "enemy",
        label: template.label,
        x: template.x ?? slot.x,
        y: template.y ?? slot.y,
        stats: template.stats,
      },
      1000 + spawnNumber,
    );
    enemy.questRoundIndex = battle.questRoundIndex;
    enemy.questWaveIndex = waveIndex;
    battle.questEnemyOrdinal += 1;
    battle.enemySpawnCounter = battle.questEnemyOrdinal;
    return enemy;
  }

  function spawnQuestWave(waveIndex, withIntro = false) {
    const round = currentQuestRound();
    const wave = round?.waves?.[waveIndex] ?? null;
    if (!wave) return [];
    battle.questWaveIndex = waveIndex;
    const spawned = [];
    wave.forEach((template, index) => {
      const enemy = makeQuestEnemy(template, waveIndex, index);
      if (withIntro) {
        const position = chooseReinforcementPosition(enemy, spawned);
        enemy.x = position.x;
        enemy.y = position.y;
      }
      spawned.push(enemy);
    });
    for (const enemy of spawned) {
      if (withIntro) {
        enemy.spawnIntro = {
          elapsed: 0,
          duration: REINFORCEMENT_SPAWN_SECONDS,
        };
      }
      battle.medals.push(enemy);
      keepMedalInsideField(enemy, false);
      addLog(`敵登場 ${enemy.label}`);
    }
    return spawned;
  }

  function spawnNextQuestWave(withIntro = true) {
    return spawnQuestWave(battle.questWaveIndex + 1, withIntro);
  }

  function spawnQuestWavesUntilCount(count, withIntro = true) {
    const spawned = [];
    while (spawned.length < count) {
      const nextWaveIndex = battle.questWaveIndex + 1;
      const nextWave = currentQuestRound()?.waves?.[nextWaveIndex];
      if (!nextWave) break;
      spawned.push(...spawnQuestWave(nextWaveIndex, withIntro));
    }
    return spawned;
  }

  function spawnRoundRefillReinforcements(withIntro = true) {
    const refillToActive = currentQuestRound()?.refillToActive ?? 0;
    if (refillToActive <= 0) return [];
    const missing = Math.max(0, refillToActive - living("enemy").length);
    if (missing <= 0) return [];
    return spawnQuestWavesUntilCount(missing, withIntro);
  }

  function startQuestRound(index) {
    battle.questRoundIndex = Math.max(0, Math.min(index, questRounds.length - 1));
    battle.questWaveIndex = -1;
    battle.questEnemyOrdinal = 0;
    battle.questComplete = false;
    battle.medals = battle.medals.filter((medal) => medal.team === "ally");
    resetAllyPositions();
    battle.enemyQueue = [];
    battle.enemyAction = null;
    battle.actedThisRound.clear();
    battle.oneMoreActive = false;
    battle.oneMoreAllyId = null;
    battle.oneMoreDefeatsThisAction.clear();
    clearRoundScopedEffects();
    spawnNextQuestWave(false);
    battle.phase = "ally";
    battle.activeId = null;
    chooseNextActive();
    const round = currentQuestRound();
    startRoundBanner(round.final ? "Final Round" : `Round ${battle.questRoundIndex + 1}`, {
      duration: ROUND_BANNER_SECONDS,
      next: null,
    });
    updateHud();
  }

  function clearRoundScopedEffects() {
    battle.bomb = null;
    battle.bombClickEffect = null;
    battle.bombExplosionEffect = null;
    battle.wallTrap = null;
    battle.wallTrapEffects = [];
    battle.wallTrapNudges = [];
    battle.wallTrapCooldowns.clear();
    battle.rushEffect = null;
    battle.rushBlowaway = null;
    battle.timeStop = null;
    battle.timeStopEffect = null;
    battle.commandSkillEffect = null;
    battle.commandSkillTargeting = null;
    battle.commandSkillStandbyId = null;
    battle.commandSkillArmedId = null;
  }

  function startRoundBanner(text, options = {}) {
    battle.roundBannerEffect = {
      text,
      elapsed: 0,
      duration: options.duration ?? ROUND_BANNER_SECONDS,
      next: options.next ?? null,
      blocking: options.blocking ?? true,
    };
    phaseText.textContent = text;
    addLog(text);
  }

  function startRoundClearOrWin() {
    battle.oneMoreActive = false;
    battle.oneMoreAllyId = null;
    battle.oneMoreDefeatsThisAction.clear();
    battle.enemyQueue = [];
    battle.enemyAction = null;
    if (isFinalQuestRound()) {
      battle.questComplete = true;
      battle.phase = "clear";
      startRoundBanner("YOU WIN !", {
        duration: QUEST_WIN_SECONDS,
        next: "win",
      });
      return true;
    }
    startRoundBanner("Round Cleared", {
      duration: ROUND_CLEAR_SECONDS,
      next: "round-transition",
    });
    return true;
  }

  function startRoundTransition(nextRoundIndex) {
    battle.roundTransitionEffect = {
      elapsed: 0,
      duration: ROUND_TRANSITION_SECONDS,
      nextRoundIndex,
      startedNextRound: false,
    };
    phaseText.textContent = "移動中";
  }

  function updateRoundBannerEffect(dt) {
    const effect = battle.roundBannerEffect;
    if (!effect) return false;
    effect.elapsed += dt;
    if (effect.elapsed < effect.duration) return effect.blocking;
    const next = effect.next;
    battle.roundBannerEffect = null;
    if (next === "round-transition") {
      startRoundTransition(battle.questRoundIndex + 1);
      return true;
    }
    if (next === "win") {
      battle.phase = "clear";
      phaseText.textContent = "YOU WIN !";
      return false;
    }
    return false;
  }

  function updateRoundTransitionEffect(dt) {
    const effect = battle.roundTransitionEffect;
    if (!effect) return false;
    effect.elapsed += dt;
    const progress = Math.min(1, effect.elapsed / effect.duration);
    if (!effect.startedNextRound && progress >= 0.5) {
      effect.startedNextRound = true;
      startQuestRound(effect.nextRoundIndex);
    }
    if (effect.elapsed >= effect.duration) {
      battle.roundTransitionEffect = null;
    }
    return true;
  }

  function spawnDefeatedRoundReinforcements(context) {
    const spawned = spawnRoundRefillReinforcements(true);
    if (spawned.length > 0) return spawned;
    const nextWaveSpawned = spawnNextQuestWave(true);
    if (nextWaveSpawned.length > 0) return nextWaveSpawned;
    startRoundClearOrWin(context);
    return [];
  }

  function isInputBlocked() {
    return Boolean(battle.roundTransitionEffect || battle.roundBannerEffect?.blocking || battle.questComplete || battle.phase === "clear");
  }

  function readyAllies() {
    const timeStopActor = timeStopActorMedal();
    if (timeStopActor && battle.timeStop?.active && !battle.timeStop.releasing) {
      return [timeStopActor];
    }
    if (battle.oneMoreActive && battle.oneMoreAllyId) {
      return living("ally").filter((m) => m.id === battle.oneMoreAllyId);
    }
    return living("ally").filter((m) => !battle.actedThisRound.has(m.id));
  }

  function isReady(medal) {
    if (battle.phase !== "ally" || medal.team !== "ally" || medal.hp <= 0) return false;
    const timeStopActor = timeStopActorMedal();
    if (timeStopActor && battle.timeStop?.active && !battle.timeStop.releasing) return medal.id === timeStopActor.id;
    if (battle.oneMoreActive) return medal.id === battle.oneMoreAllyId;
    return !battle.actedThisRound.has(medal.id);
  }

  function activeMedal() {
    if (battle.phase !== "ally") return null;
    const ready = readyAllies();
    if (ready.length === 0) return null;
    const selected = ready.find((m) => m.id === battle.activeId);
    if (selected) return selected;
    battle.activeId = ready[0].id;
    return ready[0];
  }

  function chooseNextActive() {
    battle.phase = "ally";
    if (living("ally").length === 0) {
      phaseText.textContent = "敗北";
      return;
    }

    if (readyAllies().length === 0) advanceTurn();

    const medal = activeMedal();
    if (!medal) {
      phaseText.textContent = "敗北";
      return;
    }
    phaseText.textContent = `${medal.id} 選択中`;
  }

  function advanceTurn() {
    battle.round += 1;
    tickTurnEffects();
    battle.actedThisRound.clear();
    battle.activeId = null;
    battle.nextTurnEffect = {
      elapsed: 0,
      duration: NEXT_TURN_EFFECT_SECONDS,
    };
    phaseText.textContent = "Next Turn";
    addLog("Next Turn");
  }

  function finishAction() {
    if (battle.rushEffect || battle.rushBlowaway || (battle.timeStop?.active && !battle.timeStop.releasing)) {
      debugD("finishAction blocked", {
        rushEffect: battle.rushEffect?.kind ?? "none",
        blowaway: Boolean(battle.rushBlowaway),
        timeStop: Boolean(battle.timeStop?.active),
      });
      return;
    }

    const pendingContext = battle.pendingActionContext;
    const actedMedal = battle.movingMedal;
    const actedId = actedMedal?.id ?? pendingContext?.actedId;
    const actedTeam = actedMedal?.team ?? pendingContext?.actedTeam ?? null;
    const enemyWipe = living("enemy").length === 0;
    const shouldTriggerOneMore = shouldStartOneMore(actedId, actedTeam);
    traceEvent("finish-action", {
      actedId: actedId ?? "none",
      actedTeam: actedTeam ?? "none",
      enemyWipe,
      oneMore: shouldTriggerOneMore,
      pending: pendingContext ? `${pendingContext.actedId}:${pendingContext.actedTeam}` : "none",
    }, { visible: true });
    battle.movingMedal = null;
    battle.pendingActionContext = null;
    battle.postSmashContactActorId = null;
    battle.commandSkillStandbyId = null;
    battle.commandSkillArmedId = null;
    resetCombo();
    for (const medal of battle.medals) {
      medal.vx = 0;
      medal.vy = 0;
      medal.moving = false;
      medal.activeShot = false;
      medal.bumpMoving = false;
      medal.rushBlowaway = false;
      medal.shotElapsed = 0;
      medal.bumpElapsed = 0;
      medal.bumpStartVx = 0;
      medal.bumpStartVy = 0;
    }

    const context = {
      actedId,
      actedTeam,
      enemyWipe,
    };
    battle.rushEffect = null;
    battle.rushBlowaway = null;
    battle.timeStop = null;
    battle.timeStopEffect = null;

    if (shouldTriggerOneMore) {
      startOneMore(actedId);
      updateHud();
      return;
    }

    if (battle.oneMoreActive && actedTeam === "ally") {
      battle.oneMoreActive = false;
      battle.oneMoreAllyId = null;
    }

    battle.oneMoreDefeatsThisAction.clear();
    if (enemyWipe) {
      const spawned = spawnDefeatedRoundReinforcements(context);
      if (startReinforcementEffect(spawned, context)) {
        updateHud();
        return;
      }
      updateHud();
      return;
    }

    finishActionAfterReinforcement(context);
  }

  function shouldStartOneMore(actedId, actedTeam) {
    return Boolean(
      actedId
      && actedTeam === "ally"
      && !battle.oneMoreActive
      && battle.oneMoreDefeatsThisAction.size > 0
      && living("enemy").length > 0
    );
  }

  function startOneMore(actedId) {
    battle.oneMoreActive = true;
    battle.oneMoreAllyId = actedId;
    battle.oneMoreDefeatsThisAction.clear();
    battle.oneMoreEffect = {
      elapsed: 0,
      duration: ONE_MORE_EFFECT_SECONDS,
    };
    battle.activeId = actedId;
    battle.phase = "ally";
    phaseText.textContent = `撃破1more！ ${actedId} 再行動`;
    addLog(`${actedId} 撃破1more`);
  }

  function finishActionAfterReinforcement(context) {
    traceEvent("finish-after-reinforcement", {
      actedId: context.actedId ?? "none",
      actedTeam: context.actedTeam ?? "none",
      enemyWipe: context.enemyWipe,
      livingEnemies: living("enemy").length,
    }, { visible: true });

    if (living("enemy").length === 0) {
      startRoundClearOrWin();
      updateHud();
      return;
    }

    const refillContext = {
      ...context,
      refillChecked: true,
    };
    const refillSpawned = context.refillChecked ? [] : spawnRoundRefillReinforcements(true);
    if (startReinforcementEffect(refillSpawned, refillContext)) {
      updateHud();
      return;
    }
    context = refillContext;

    if (context.enemyWipe && (context.actedTeam === "ally" || context.actedTeam === "enemy")) {
      if (context.actedTeam === "ally" && context.actedId) advanceAllyHand();
      battle.oneMoreActive = false;
      battle.oneMoreAllyId = null;
      battle.enemyQueue = [];
      battle.enemyAction = null;
      battle.actedThisRound.clear();
      advanceTurn();
      chooseNextActive();
      updateHud();
      return;
    }

    if (context.actedTeam === "enemy") {
      const actedEnemy = battle.medals.find((medal) => medal.id === context.actedId && medal.team === "enemy");
      traceEvent("finish-enemy-branch", {
        actedId: context.actedId ?? "none",
        found: Boolean(actedEnemy),
        hp: actedEnemy?.hp ?? "none",
        defeatPending: actedEnemy?.defeatPending ?? "none",
        removed: actedEnemy?.removed ?? "none",
      }, { visible: true });
      if (actedEnemy) {
        finishEnemyAction(actedEnemy);
        return;
      }
      beginNextEnemyAction();
      return;
    }

    if (context.actedId) {
      battle.actedThisRound.add(context.actedId);
      advanceAllyHand();
      decrementEnemyCounts();
      if (queueReadyEnemies()) {
        beginNextEnemyAction();
        updateHud();
        return;
      }
    }

    battle.activeId = null;
    chooseNextActive();
    updateHud();
  }

  function advanceAllyHand() {
    battle.hand += 1;
  }

  function tickTurnEffects() {
    for (const enemy of battle.medals) {
      if (enemy.team !== "enemy" || enemy.removed || enemy.confusionTurns <= 0) continue;
      enemy.confusionTurns = Math.max(0, enemy.confusionTurns - 1);
      if (enemy.confusionTurns === 0) addLog(`${enemy.id} 混乱解除`);
    }

    if (battle.wallTrap?.turnsRemaining > 0) {
      battle.wallTrap.turnsRemaining = Math.max(0, battle.wallTrap.turnsRemaining - 1);
      if (battle.wallTrap.turnsRemaining === 0) {
        addLog("壁停止効果 終了");
        battle.wallTrap = null;
      }
    }
  }

  function startReinforcementEffect(spawned, context) {
    if (!spawned || spawned.length === 0) return false;
    battle.reinforcementEffect = {
      spawnedIds: spawned.map((enemy) => enemy.id),
      elapsed: 0,
      duration: REINFORCEMENT_EFFECT_SECONDS,
      context,
    };
    phaseText.textContent = "増援";
    addLog(`増援 ${spawned.length}体`);
    return true;
  }

  function hasMovingMedals() {
    return battle.medals.some((medal) => isOnBoard(medal) && medal.moving);
  }

  function currentRushBlowawayMedals() {
    if (!battle.rushBlowaway) return { actor: null, blown: null };
    return {
      actor: battle.medals.find((medal) => medal.id === battle.rushBlowaway.actorId) ?? null,
      blown: battle.medals.find((medal) => medal.id === battle.rushBlowaway.targetId) ?? null,
    };
  }

  function finishRushBlowawayState(reason = "settled") {
    const { actor, blown } = currentRushBlowawayMedals();
    if (!actor) {
      debugD("blowaway lost actor", { reason });
      battle.rushBlowaway = null;
      return false;
    }

    if (blown && isOnBoard(blown)) {
      const dx = blown.x - actor.x;
      const dy = blown.y - actor.y;
      const dist = Math.hypot(dx, dy) || 0.0001;
      const minDist = actor.radius + blown.radius;
      const state = battle.rushBlowaway;
      const hasActuallyMoved = (state?.elapsed ?? 0) >= 0.04 || (state?.traveledDistance ?? 0) >= 12;
      debugD("blowaway finish check", {
        reason,
        target: blown.id,
        hp: blown.hp,
        pending: blown.defeatPending,
        dist,
        min: minDist,
        moved: hasActuallyMoved,
      });
      if (!blown.defeatPending && blown.hp > 0 && hasActuallyMoved && dist <= minDist + 12) {
        const contactX = dx / dist;
        const contactY = dy / dist;
        spawnImpactEffect(
          blown.x - contactX * blown.radius,
          blown.y - contactY * blown.radius,
          -contactX,
          -contactY,
          1.35,
        );
        addCsGauge(1);
        battle.contactLocks.delete(pairKey(actor, blown));
        battle.collisionMemory.delete(`${actor.id}->${blown.id}`);
        battle.collisionMemory.delete(`${blown.id}->${actor.id}`);
        debugD("blowaway loop from finish", { reason, target: blown.id });
        startRushStrike(actor, blown, `loop-${reason}`);
        return true;
      }
    }

    debugD("blowaway enters time stop", { reason, actor: actor.id });
    enterTimeStop(actor);
    return true;
  }

  function finishActionWhenSettled() {
    if (!battle.movingMedal && !battle.pendingActionContext) return;
    if (battle.defeatEffect || battle.postDefeatPause) return;
    if (battle.rushEffect) {
      debugD("settle waits rushEffect", { kind: battle.rushEffect.kind });
      return;
    }
    if (battle.commandSkillEffect) {
      traceEvent("settle-waits-cs-effect", {
        type: battle.commandSkillEffect.type ?? "unknown",
      }, { visible: true });
      return;
    }
    if (isBlockingBombExplosionEffect()) {
      traceEvent("settle-waits-bomb-effect", {
        kind: battle.bombExplosionEffect.kind ?? "bomb",
        triggerEnemy: battle.bombExplosionEffect.triggerEnemyId ?? "none",
        hits: `${battle.bombExplosionEffect.appliedHits}/${battle.bombExplosionEffect.hits}`,
      }, { visible: true });
      return;
    }
    if (battle.rushBlowaway) {
      const { blown } = currentRushBlowawayMedals();
      if (!blown || !isOnBoard(blown) || !blown.moving || !blown.rushBlowaway) {
        finishRushBlowawayState("stopped");
        return;
      }
    }
    if (hasMovingMedals()) return;
    if (battle.rushBlowaway) {
      finishRushBlowawayState("settled");
      return;
    }
    if (battle.timeStop?.active && !battle.timeStop.releasing) {
      startTimeStopRelease();
      return;
    }
    const defeated = pendingDefeatedMedals();
    if (defeated.length > 0) {
      traceEvent("settled-start-shatter", {
        defeated: defeated.map((medal) => medal.id),
      }, { visible: true });
      startDefeatEffect(defeated, "shatter");
      return;
    }
    phaseText.textContent = "動きが収まった";
    traceEvent("settled-finish-action", {}, { visible: true });
    finishAction();
  }

  function decrementEnemyCounts() {
    for (const enemy of living("enemy")) {
      enemy.count = Math.max(0, enemy.count - 1);
    }
  }

  function queueReadyEnemies() {
    battle.enemyQueue = living("enemy")
      .filter((enemy) => enemy.count <= 0)
      .map((enemy) => enemy.id);
    if (battle.enemyQueue.length === 0) return false;
    addLog(`敵 ${battle.enemyQueue.length} 体が行動準備`);
    return true;
  }

  function beginNextEnemyAction() {
    const enemy = nextQueuedEnemy();
    if (!enemy) {
      traceEvent("enemy-action-none", {}, { visible: true });
      battle.enemyQueue = [];
      battle.enemyAction = null;
      battle.phase = "ally";
      battle.activeId = null;
      chooseNextActive();
      return;
    }

    const target = nearestLivingAlly(enemy);
    if (!target) {
      battle.phase = "defeat";
      phaseText.textContent = "敗北";
      return;
    }

    const dx = target.x - enemy.x;
    const dy = target.y - enemy.y;
    const len = Math.hypot(dx, dy) || 1;
    battle.phase = "enemy-warning";
    battle.activeId = null;
    battle.enemyAction = {
      enemyId: enemy.id,
      targetId: target.id,
      dirX: dx / len,
      dirY: dy / len,
      stage: "warning",
      elapsed: 0,
    };
    traceEvent("enemy-action-warning", {
      enemy: enemy.id,
      target: target.id,
      confusion: enemy.confusionTurns,
      count: enemy.count,
    }, { visible: true });
    phaseText.textContent = `${enemy.id} 行動予兆`;
  }

  function nextQueuedEnemy() {
    while (battle.enemyQueue.length > 0) {
      const id = battle.enemyQueue.shift();
      const enemy = battle.medals.find((m) => m.id === id && m.hp > 0 && m.count <= 0);
      if (enemy) return enemy;
    }
    return null;
  }

  function nearestLivingAlly(enemy) {
    let best = null;
    let bestDistance = Infinity;
    for (const ally of living("ally")) {
      const d = distance(enemy, ally);
      if (d < bestDistance) {
        best = ally;
        bestDistance = d;
      }
    }
    return best;
  }

  function updateEnemyTelegraph(dt) {
    const action = battle.enemyAction;
    if (!action || battle.movingMedal) return;

    const enemy = battle.medals.find((m) => m.id === action.enemyId && m.hp > 0);
    if (!enemy) {
      traceEvent("enemy-telegraph-lost", {
        enemy: action.enemyId,
        stage: action.stage,
      }, { visible: true });
      beginNextEnemyAction();
      return;
    }

    action.elapsed += dt;
    if (action.stage === "warning" && action.elapsed >= ENEMY_WARNING_SECONDS) {
      action.stage = "arrow";
      action.elapsed = 0;
      phaseText.textContent = `${enemy.id} 狙いを定めている`;
      return;
    }

    if (action.stage === "arrow" && action.elapsed >= ENEMY_ARROW_SECONDS) {
      launchEnemyAction(enemy, action);
    }
  }

  function launchEnemyAction(enemy, action) {
    const directionSign = enemy.confusionTurns > 0 ? -1 : 1;
    enemy.currentSpeed = enemy.moveSpeed;
    enemy.remainingDistance = enemy.moveDistance;
    enemy.decelDuration = DECEL_SECONDS;
    enemy.decelDistance = enemy.currentSpeed * enemy.decelDuration * 0.5;
    enemy.constantTravelTime = Math.max(0, (enemy.moveDistance - enemy.decelDistance) / enemy.currentSpeed);
    enemy.shotElapsed = 0;
    enemy.vx = action.dirX * enemy.currentSpeed * directionSign;
    enemy.vy = action.dirY * enemy.currentSpeed * directionSign;
    enemy.moving = true;
    enemy.activeShot = true;
    battle.phase = "enemy-moving";
    battle.movingMedal = enemy;
    battle.enemyAction = null;
    traceEvent("enemy-action-launch", {
      enemy: enemy.id,
      target: action.targetId,
      confusion: enemy.confusionTurns,
      directionSign,
      vx: enemy.vx,
      vy: enemy.vy,
    }, { visible: true });
    phaseText.textContent = `${enemy.id} 攻撃中`;
    addLog(enemy.confusionTurns > 0 ? `${enemy.id} 混乱して逆走` : `${enemy.id} 攻撃`);
  }

  function finishEnemyAction(enemy) {
    traceEvent("finish-enemy-action", {
      enemy: enemy.id,
      hp: enemy.hp,
      defeatPending: enemy.defeatPending,
      removed: enemy.removed,
      count: enemy.count,
    }, { visible: true });
    if (enemy.count <= 0) enemy.count = enemy.initialCount;
    if (living("ally").length === 0) {
      phaseText.textContent = "敗北";
      updateHud();
      return;
    }
    beginNextEnemyAction();
    updateHud();
  }

  function updateHud() {
    const medal = activeMedal();
    activeStats.innerHTML = "";
    renderPartyHud();
    if (!medal) return;

    const rows = [
      ["HP", `${Math.max(0, Math.ceil(medal.hp))} / ${medal.maxHp}`],
      ["攻撃力", medal.attack],
      ["加算", displayAttackModifier(medal)],
      ["防御力", medal.defense],
      ["移動速度", medal.moveSpeed],
      ["移動距離", displayMoveDistance(medal)],
      ["射程範囲", medal.range],
      ["スマッシュ", `${Math.round(medal.smashDamage * 100)}%`],
      ["CS", commandSkillSummary(medal)],
      ["大きさ", medal.size],
    ];

    for (const [name, value] of rows) {
      const label = document.createElement("span");
      const data = document.createElement("span");
      label.textContent = name;
      data.textContent = value;
      activeStats.append(label, data);
    }
  }

  function commandSkillSummary(medal) {
    if (medal.commandSkillType === "bomb") {
      return `${medal.commandSkillName} / 消費${medal.commandSkillCost} / ${formatPercent(medal.commandSkillDamage)}×${medal.commandSkillBombHits}連 / 回避${medal.commandSkillBombDodgeHands}手`;
    }
    if (medal.commandSkillType === "point-bomb") {
      return `${medal.commandSkillName} / 消費${medal.commandSkillCost} / ${medal.commandSkillAreaLabel} / ${formatPercent(medal.commandSkillDamage)}`;
    }
    if (medal.commandSkillType === "rush-time-stop") {
      return `${medal.commandSkillName} / 消費${medal.commandSkillCost} / ${formatPercent(medal.commandSkillRushDamage)}×${medal.commandSkillRushHits}連`;
    }
    if (medal.commandSkillType === "confusion-wall") {
      return `${medal.commandSkillName} / 消費${medal.commandSkillCost} / ${medal.commandSkillAreaLabel} / ${formatPercent(medal.commandSkillDamage)}×${medal.commandSkillBombHits}連`;
    }
    return `${medal.commandSkillName} / ${formatPercent(medal.commandSkillDamage)}`;
  }

  function formatPercent(value) {
    return `${Math.round(value * 100)}％`;
  }

  function displayMoveDistance(medal) {
    return Math.floor(medal.moveDistance * 0.05);
  }

  function displayAttackModifier(medal) {
    return formatPercent(medal.attackModifier ?? 1);
  }

  function commandSkillCostLabel(medal) {
    return `消費ゲージ: ${medal.commandSkillCost}`;
  }

  function commandSkillDescription(medal) {
    if (medal.commandSkillType === "bomb") return bombCommandSkillDescription(medal);
    if (medal.commandSkillType === "point-bomb") return pointBombCommandSkillDescription(medal);
    if (medal.commandSkillType === "rush-time-stop") return rushTimeStopCommandSkillDescription(medal);
    if (medal.commandSkillType === "confusion-wall") return confusionWallCommandSkillDescription(medal);
    return `敵全体に${formatPercent(medal.commandSkillDamage)}のダメージを与える`;
  }

  function bombCommandSkillDescription(medal) {
    return `敵一体を選択し爆弾を設置する。敵行動中にタップすると起爆し、爆弾を設置した敵を中心に${medal.commandSkillAreaLabel}範囲に${formatPercent(medal.commandSkillDamage)}×${medal.commandSkillBombHits}連ダメージ＆カウント+${medal.commandSkillBombCountDelay}。起爆or${medal.commandSkillBombDodgeHands}手経過するまで、味方全員は敵の接触攻撃を回避する`;
  }

  function pointBombCommandSkillDescription(medal) {
    const defenseText = medal.commandSkillDefenseIgnore ? "防御無視の" : "";
    const damageText = medal.commandSkillBombHits === 1
      ? `${formatPercent(medal.commandSkillDamage)}ダメージ`
      : `${formatPercent(medal.commandSkillDamage)}×${medal.commandSkillBombHits}回ダメージ`;
    return `画面内の好きな位置を選択し爆弾を設置、そのまま起爆する。設置地点を中心に${medal.commandSkillAreaLabel}範囲へ${defenseText}${damageText}＆カウント+${medal.commandSkillBombCountDelay}。このCSで撃破した敵の数×${medal.commandSkillCsGainPerDefeat}だけCSゲージを回復する`;
  }

  function rushTimeStopCommandSkillDescription(medal) {
    return `敵一体を選択し、防御無視の${formatPercent(medal.commandSkillRushDamage)}×${medal.commandSkillRushHits}連撃を与えて、自身の移動距離で吹き飛ばし。再接触で同じ効果を発動する。移動停止かタップで時を止め、移動距離+${medal.commandSkillMoveBoost * 100}％、加算+${medal.commandSkillAttackAdd * 100}％、周囲ダメージ状態で再行動。停止時、敵全体へ${formatPercent(medal.commandSkillFinishDamage)}×${medal.commandSkillFinishHits}連撃を与える。`;
  }

  function confusionWallCommandSkillDescription(medal) {
    const defenseText = medal.commandSkillWallTrapDefenseIgnore ? "防御無視" : "";
    return `${medal.commandSkillAreaLabel}の敵に${formatPercent(medal.commandSkillDamage)}×${medal.commandSkillBombHits}連撃、${medal.commandSkillConfusionTurns}ターンの間混乱（逆方向に移動）を付与。さらに${medal.commandSkillWallTrapTurns}ターンの間、壁に接触した敵を停止させ、その敵と周囲${medal.commandSkillWallTrapAreaLabel}に${defenseText}${formatPercent(medal.commandSkillWallTrapDamage)}×${medal.commandSkillWallTrapHits}連撃を与える`;
  }

  function addCsGauge(amount) {
    if (amount <= 0) return;
    if (battle.timeStop?.active) return;
    battle.csGauge = Math.max(0, Math.min(100, battle.csGauge + amount));
    updateHud();
  }

  function spendCsGauge(amount) {
    battle.csGauge = Math.max(0, battle.csGauge - amount);
    updateHud();
  }

  function comboAnimationDuration(amount, requestedDuration = null) {
    if (requestedDuration != null) return Math.max(0, requestedDuration);
    if (amount <= 1) return 0;
    return Math.max(0.18, Math.min(0.72, amount * 0.012));
  }

  function resetCombo() {
    battle.comboCount = 0;
    battle.comboDisplayCount = 0;
    battle.comboAnimation = null;
  }

  function addCombo(amount = 1, options = {}) {
    if (amount <= 0) return;
    const from = Math.max(0, Math.round(battle.comboDisplayCount ?? battle.comboCount));
    const to = Math.max(0, battle.comboCount + amount);
    battle.comboCount = to;

    const duration = comboAnimationDuration(amount, options.duration);
    if (duration <= 0) {
      if (battle.comboAnimation) {
        battle.comboAnimation.to = to;
      } else {
        battle.comboDisplayCount = to;
        battle.comboAnimation = null;
      }
      return;
    }

    battle.comboAnimation = {
      from,
      to,
      elapsed: 0,
      duration,
    };
  }

  function awardEffectCombo(effect, amount, options = {}) {
    if (!effect || effect.comboAwarded || amount <= 0) return;
    addCombo(amount, options);
    effect.comboAwarded = true;
  }

  function updateComboAnimation(dt) {
    const animation = battle.comboAnimation;
    if (!animation) return;
    animation.elapsed = Math.min(animation.duration, animation.elapsed + dt);
    const t = animation.duration <= 0 ? 1 : animation.elapsed / animation.duration;
    const eased = 1 - (1 - t) ** 2;
    battle.comboDisplayCount = Math.min(animation.to, Math.floor(animation.from + (animation.to - animation.from) * eased));
    if (animation.elapsed >= animation.duration) {
      battle.comboDisplayCount = animation.to;
      battle.comboAnimation = null;
    }
  }

  function hasActiveBomb() {
    if (!battle.bomb) return false;
    const target = battle.medals.find((m) => m.id === battle.bomb.targetId);
    return Boolean(target && isOnBoard(target) && target.hp > 0 && !target.defeatPending);
  }

  function hasActiveWallTrap() {
    return Boolean(battle.wallTrap && battle.wallTrap.turnsRemaining > 0);
  }

  function isBombDodgeActive() {
    return Boolean(hasActiveBomb() && battle.hand < battle.bomb.dodgeExpiresAtHand);
  }

  function canUseBombCommandSkill(medal) {
    return medal.commandSkillType !== "bomb" || !hasActiveBomb();
  }

  function canUseConfusionWallCommandSkill(medal) {
    return medal.commandSkillType !== "confusion-wall" || !hasActiveWallTrap();
  }

  function canPrimeCommandSkill(medal = activeMedal()) {
    return Boolean(
      medal
      && medal.team === "ally"
      && isReady(medal)
      && battle.phase === "ally"
      && !battle.movingMedal
      && !battle.commandSkillEffect
      && !battle.commandSkillTargeting
      && !battle.bombExplosionEffect
      && !battle.rushEffect
      && !battle.rushBlowaway
      && !battle.timeStop?.active
      && !battle.reinforcementEffect
      && !battle.roundBannerEffect
      && !battle.questComplete
      && !battle.smashEffect
      && !battle.defeatEffect
      && living("enemy").length > 0
      && battle.csGauge >= medal.commandSkillCost
      && canUseBombCommandSkill(medal)
      && canUseConfusionWallCommandSkill(medal)
    );
  }

  function isCommandSkillStandby(medal) {
    return medal?.id === battle.commandSkillStandbyId;
  }

  function isCommandSkillArmed(medal) {
    return medal?.id === battle.commandSkillArmedId;
  }

  function commandSkillPreviewRadius(medal) {
    if (!medal || medal.commandSkillType !== "confusion-wall") return 0;
    return medal.commandSkillBombRadius;
  }

  function shouldShowCommandSkillPreview(medal) {
    return commandSkillPreviewRadius(medal) > 0
      && (isCommandSkillStandby(medal) || isCommandSkillArmed(medal));
  }

  function shouldShowActiveCommandSkillPreview(medal) {
    return commandSkillPreviewRadius(medal) > 0
      && isCommandSkillArmed(medal)
      && medal?.activeShot;
  }

  function primeCommandSkill(medal) {
    if (!canPrimeCommandSkill(medal)) return false;
    battle.activeId = medal.id;
    battle.commandSkillStandbyId = medal.id;
    battle.commandSkillArmedId = null;
    phaseText.textContent = `${medal.id} CS待機`;
    updateHud();
    return true;
  }

  function toggleCommandSkillStandby(medal) {
    if (isCommandSkillStandby(medal)) {
      battle.commandSkillStandbyId = null;
      phaseText.textContent = `${medal.id} 選択中`;
      updateHud();
      return true;
    }
    return primeCommandSkill(medal);
  }

  function renderCommandSkillStandbyInfo() {
    if (!csStandbyInfo) return;
    const medal = battle.medals.find((m) => m.id === battle.commandSkillStandbyId && m.team === "ally") ?? null;
    if (!medal || !canPrimeCommandSkill(medal)) {
      csStandbyInfo.hidden = true;
      csStandbyInfo.innerHTML = "";
      return;
    }

    csStandbyInfo.hidden = false;
    csStandbyInfo.innerHTML = "";
    const title = document.createElement("div");
    title.className = "cs-standby-title";
    title.textContent = `${medal.id} ${medal.commandSkillName}`;
    const text = document.createElement("div");
    text.className = "cs-standby-text";
    text.textContent = commandSkillDescription(medal);
    csStandbyInfo.append(title, text);
  }

  function renderPartyHud() {
    if (csGaugeFill) csGaugeFill.style.width = `${battle.csGauge}%`;
    if (csGaugeText) csGaugeText.textContent = `${battle.csGauge} / 100`;
    renderCommandSkillStandbyInfo();
    const allies = battle.medals.filter((m) => m.team === "ally");
    const inspected = allies.find((m) => m.id === battle.inspectedAllyId) ?? null;
    if (battle.detailOpen && inspected) {
      renderPartyDetail(inspected);
    } else {
      battle.detailOpen = false;
      renderPartyDetail(null);
    }
    if (!partyCards) return;

    partyCards.innerHTML = "";
    for (const medal of allies) {
      const card = document.createElement("article");
      card.className = "party-card";
      if (medal === activeMedal() && battle.phase === "ally" && !battle.movingMedal) card.classList.add("is-active");
      if (battle.detailOpen && medal.id === battle.inspectedAllyId) card.classList.add("is-selected");
      if (battle.actedThisRound.has(medal.id)) card.classList.add("is-acted");
      card.tabIndex = 0;
      card.setAttribute("role", "button");
      card.setAttribute("aria-label", `仮キャラ ${medal.label} の詳細を見る`);
      card.addEventListener("click", () => inspectAlly(medal.id));
      card.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        inspectAlly(medal.id);
      });

      const head = document.createElement("div");
      head.className = "party-card-head";

      const portrait = document.createElement("div");
      portrait.className = "portrait";
      portrait.textContent = medal.label;
      head.appendChild(portrait);

      const hpTrack = document.createElement("div");
      hpTrack.className = "hp-track";
      const hpFill = document.createElement("div");
      const hpRatio = Math.max(0, Math.min(1, medal.hp / medal.maxHp));
      hpFill.className = `hp-fill${hpRatio <= 0.35 ? " is-low" : ""}`;
      hpFill.style.width = `${hpRatio * 100}%`;
      hpTrack.appendChild(hpFill);

      const hpText = document.createElement("div");
      hpText.className = "hp-text";
      hpText.textContent = `HP ${Math.max(0, Math.ceil(medal.hp))}`;

      card.append(head, hpTrack, hpText);
      partyCards.appendChild(card);
    }
  }

  function inspectAlly(id) {
    selectAllyForAction(id);
    if (battle.detailOpen && battle.inspectedAllyId === id) {
      hidePartyDetail();
      return;
    }
    battle.inspectedAllyId = id;
    battle.detailOpen = true;
    updateHud();
  }

  function selectAllyForAction(id) {
    const medal = battle.medals.find((m) => m.id === id && m.team === "ally");
    if (!medal || !isReady(medal) || battle.movingMedal) return;
    battle.activeId = medal.id;
    if (battle.commandSkillStandbyId !== medal.id) battle.commandSkillStandbyId = null;
    phaseText.textContent = `${medal.id} 選択中`;
  }

  function hidePartyDetail() {
    battle.detailOpen = false;
    updateHud();
  }

  function renderPartyDetail(medal) {
    if (!partyDetail) return;
    partyDetail.innerHTML = "";
    if (!medal) {
      partyDetail.hidden = true;
      return;
    }
    partyDetail.hidden = false;

    const title = document.createElement("div");
    title.className = "party-detail-title";
    const portrait = document.createElement("div");
    portrait.className = "portrait";
    portrait.textContent = medal.label;
    const name = document.createElement("div");
    name.textContent = `仮キャラ ${medal.label}`;
    title.append(portrait, name);

    const grid = document.createElement("div");
    grid.className = "party-detail-grid";
    const details = [
      ["現在HP", Math.max(0, Math.ceil(medal.hp))],
      ["最大HP", medal.maxHp],
      ["攻撃力", medal.attack],
      ["加算", displayAttackModifier(medal)],
      ["防御力", medal.defense],
      ["移動距離", displayMoveDistance(medal)],
      ["射程範囲", medal.range],
      ["スマッシュ", `${Math.round(medal.smashDamage * 100)}%`],
      ["パラメータ変化", "なし", "is-wide"],
      ["状態変化", "なし", "is-wide"],
      ["CS", commandSkillDescription(medal), "is-full", commandSkillCostLabel(medal)],
    ];

    for (const [label, value, modifier, meta] of details) {
      const item = document.createElement("div");
      item.className = `detail-item${modifier ? ` ${modifier}` : ""}`;
      const labelElement = document.createElement("div");
      labelElement.className = `detail-label${meta ? " has-meta" : ""}`;
      if (meta) {
        const labelName = document.createElement("span");
        labelName.textContent = label;
        const metaElement = document.createElement("span");
        metaElement.className = "detail-label-meta";
        metaElement.textContent = meta;
        labelElement.append(labelName, metaElement);
      } else {
        labelElement.textContent = label;
      }
      const valueElement = document.createElement("div");
      valueElement.className = "detail-value";
      valueElement.textContent = value;
      item.append(labelElement, valueElement);
      grid.appendChild(item);
    }

    partyDetail.append(title, grid);
  }

  function pointerPosition(event) {
    const rect = canvas.getBoundingClientRect();
    const source = event.touches?.[0] ?? event.changedTouches?.[0] ?? event;
    return {
      x: ((source.clientX - rect.left) / rect.width) * field.width,
      y: ((source.clientY - rect.top) / rect.height) * field.height,
    };
  }

  function isInsidePlayField(pos) {
    return pos.x >= field.padding
      && pos.x <= field.width - field.padding
      && pos.y >= field.padding
      && pos.y <= field.height - field.padding;
  }

  function releaseDragPointer(event) {
    const pointerId = event?.pointerId ?? battle.dragPointerId;
    if (pointerId == null || !canvas.releasePointerCapture) return;
    try {
      if (!canvas.hasPointerCapture || canvas.hasPointerCapture(pointerId)) {
        canvas.releasePointerCapture(pointerId);
      }
    } catch {
      // Pointer capture may already be gone after browser-level cancel/release.
    }
  }

  function clearDragState(event) {
    releaseDragPointer(event);
    battle.dragging = false;
    battle.dragStart = null;
    battle.dragNow = null;
    battle.dragPointerStart = null;
    battle.dragPointerNow = null;
    battle.dragPointerId = null;
    battle.dragRemote = false;
    battle.dragPickedId = null;
    battle.dragOutsideField = false;
  }

  function distance(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  function clampDrag(medal, pos) {
    const dx = pos.x - medal.x;
    const dy = pos.y - medal.y;
    const len = Math.hypot(dx, dy);
    if (len <= medal.range) return pos;
    const scale = medal.range / len;
    return {
      x: medal.x + dx * scale,
      y: medal.y + dy * scale,
    };
  }

  function remoteDragPosition(medal, pos) {
    if (!battle.dragPointerStart) return { x: medal.x, y: medal.y };
    const dx = pos.x - battle.dragPointerStart.x;
    const dy = pos.y - battle.dragPointerStart.y;
    const len = Math.hypot(dx, dy);
    if (len <= medal.range) {
      return {
        x: medal.x + dx,
        y: medal.y + dy,
      };
    }
    const scale = medal.range / len;
    return {
      x: medal.x + dx * scale,
      y: medal.y + dy * scale,
    };
  }

  function launchActive(event) {
    if (battle.phase !== "ally") return;
    const medal = activeMedal();
    if (!medal || !battle.dragStart || !battle.dragNow || battle.dragOutsideField) {
      clearDragState(event);
      return;
    }

    const pullX = battle.dragNow.x - medal.x;
    const pullY = battle.dragNow.y - medal.y;
    const pullLength = Math.hypot(pullX, pullY);
    const pointerTravel = battle.dragPointerStart && battle.dragPointerNow
      ? distance(battle.dragPointerStart, battle.dragPointerNow)
      : 0;
    const isRemoteTap = battle.dragRemote && pointerTravel < MIN_REMOTE_POINTER_TRAVEL;
    const dragPickedId = battle.dragPickedId;
    clearDragState(event);

    if (pullLength < MIN_LAUNCH_PULL_DISTANCE || isRemoteTap) {
      if (!isRemoteTap && dragPickedId === medal.id) toggleCommandSkillStandby(medal);
      return;
    }
    const commandSkillLaunch = isCommandSkillStandby(medal) && canPrimeCommandSkill(medal);

    const dirX = -pullX / pullLength;
    const dirY = -pullY / pullLength;
    medal.currentSpeed = medal.moveSpeed;
    medal.remainingDistance = medal.moveDistance;
    medal.decelDuration = DECEL_SECONDS;
    medal.decelDistance = medal.currentSpeed * medal.decelDuration * 0.5;
    medal.constantTravelTime = Math.max(0, (medal.moveDistance - medal.decelDistance) / medal.currentSpeed);
    medal.shotElapsed = 0;
    medal.vx = dirX * medal.currentSpeed;
    medal.vy = dirY * medal.currentSpeed;
    medal.moving = true;
    medal.activeShot = true;
    battle.movingMedal = medal;
    if (!battle.timeStop?.active) battle.oneMoreDefeatsThisAction.clear();
    if (commandSkillLaunch) {
      battle.commandSkillStandbyId = null;
      battle.commandSkillArmedId = medal.id;
      spendCsGauge(medal.commandSkillCost);
      phaseText.textContent = `${medal.id} CS移動中`;
      addLog(`${medal.id} CS待機射出`);
    } else {
      if (battle.commandSkillStandbyId === medal.id) battle.commandSkillStandbyId = null;
      battle.commandSkillArmedId = null;
      phaseText.textContent = `${medal.id} 移動中`;
      addLog(`${medal.id} 発射`);
    }
  }

  function triggerSmash() {
    const medal = battle.movingMedal;
    if (!medal || medal.team !== "ally" || !medal.activeShot || battle.smashEffect) return false;

    medal.vx = 0;
    medal.vy = 0;
    medal.moving = false;
    medal.activeShot = false;
    medal.bumpMoving = false;
    medal.bumpElapsed = 0;
    medal.bumpStartVx = 0;
    medal.bumpStartVy = 0;

    battle.smashEffect = {
      x: medal.x,
      y: medal.y,
      medalRadius: medal.radius,
      range: medal.range,
      elapsed: 0,
      duration: SMASH_EFFECT_SECONDS,
    };
    battle.postSmashContactActorId = medal.id;

    const targets = living("enemy").filter((enemy) => distance(medal, enemy) <= medal.range + enemy.radius);
    addLog(`${medal.id} スマッシュ`);
    addCombo(1);
    if (targets.length === 0) {
      addLog("範囲内に敵がいない");
    }

    for (const enemy of targets) {
      const damage = calculateDamage(medal, enemy, medal.smashDamage);
      applyDamage(medal, enemy, damage, "スマッシュダメージ");
    }
    addCsGauge(targets.length * 2);

    phaseText.textContent = `${medal.id} スマッシュ`;
    return true;
  }

  function stopActiveShotForSkill(medal) {
    medal.vx = 0;
    medal.vy = 0;
    medal.moving = false;
    medal.activeShot = false;
    medal.bumpMoving = false;
    medal.bumpElapsed = 0;
    medal.bumpStartVx = 0;
    medal.bumpStartVy = 0;
    battle.commandSkillArmedId = null;
  }

  function triggerCommandSkill() {
    const medal = battle.movingMedal;
    if (
      !medal
      || medal.team !== "ally"
      || !medal.activeShot
      || !isCommandSkillArmed(medal)
      || battle.commandSkillEffect
      || battle.commandSkillTargeting
    ) {
      return false;
    }

    battle.detailOpen = false;
    clearDragState();
    stopActiveShotForSkill(medal);

    if (medal.commandSkillType === "bomb") {
      battle.commandSkillTargeting = {
        mode: "enemy-bomb",
        casterId: medal.id,
        elapsed: 0,
      };
      phaseText.textContent = `${medal.id} 爆弾設置対象を選択`;
      addLog(`${medal.id} CS対象選択`);
      updateHud();
      return true;
    }

    if (medal.commandSkillType === "point-bomb") {
      battle.commandSkillTargeting = {
        mode: "point-bomb",
        casterId: medal.id,
        elapsed: 0,
        radius: medal.commandSkillBombRadius,
      };
      phaseText.textContent = `${medal.id} 爆破地点を選択`;
      addLog(`${medal.id} 爆破地点選択`);
      updateHud();
      return true;
    }

    if (medal.commandSkillType === "rush-time-stop") {
      battle.commandSkillTargeting = {
        mode: "enemy-rush",
        casterId: medal.id,
        elapsed: 0,
      };
      phaseText.textContent = `${medal.id} 連撃対象を選択`;
      addLog(`${medal.id} CS対象選択`);
      updateHud();
      return true;
    }

    if (medal.commandSkillType === "confusion-wall") {
      startConfusionWallCommandSkill(medal);
      return true;
    }

    const targets = living("enemy");
    battle.commandSkillEffect = {
      type: "all",
      casterId: medal.id,
      x: medal.x,
      y: medal.y,
      name: medal.commandSkillName,
      targetIds: targets.map((target) => target.id),
      elapsed: 0,
      duration: COMMAND_SKILL_EFFECT_SECONDS,
      damageAt: 0.76,
      damageApplied: false,
    };

    addLog(`${medal.id} CS発動`);
    phaseText.textContent = `${medal.id} ${medal.commandSkillName}`;

    updateHud();
    return true;
  }

  function startConfusionWallCommandSkill(caster) {
    const targets = living("enemy")
      .filter((enemy) => distance(caster, enemy) <= caster.commandSkillBombRadius + enemy.radius);

    for (const enemy of targets) {
      enemy.confusionTurns = Math.max(enemy.confusionTurns, caster.commandSkillConfusionTurns);
    }

    battle.wallTrap = {
      casterId: caster.id,
      attack: caster.attack,
      turnsRemaining: caster.commandSkillWallTrapTurns,
      radius: caster.commandSkillWallTrapRadius,
      hits: caster.commandSkillWallTrapHits,
      damageMultiplier: caster.commandSkillWallTrapDamage,
      defenseIgnore: caster.commandSkillWallTrapDefenseIgnore,
    };

    battle.commandSkillEffect = {
      type: "confusion-wall",
      casterId: caster.id,
      x: caster.x,
      y: caster.y,
      name: caster.commandSkillName,
      targetIds: targets.map((target) => target.id),
      elapsed: 0,
      duration: CONFUSION_WALL_HIT_START
        + caster.commandSkillBombHits * CONFUSION_WALL_HIT_INTERVAL
        + CONFUSION_WALL_EFFECT_TAIL,
      hits: caster.commandSkillBombHits,
      damageMultiplier: caster.commandSkillDamage,
      radius: caster.commandSkillBombRadius,
      appliedHits: 0,
      hitStart: CONFUSION_WALL_HIT_START,
      hitInterval: CONFUSION_WALL_HIT_INTERVAL,
      waveCount: caster.commandSkillWaveCount,
      defeatedIds: new Set(),
    };

    traceEvent("E-CS-start", {
      caster: caster.id,
      targets: targets.map((target) => target.id),
      radius: caster.commandSkillBombRadius,
      wallTrapTurns: caster.commandSkillWallTrapTurns,
    }, { visible: true });
    addLog(`${caster.id} ${caster.commandSkillName}`);
    if (targets.length > 0) addLog(`混乱付与 ${targets.length}体`);
    else addLog("範囲内に敵がいない");
    phaseText.textContent = `${caster.id} ${caster.commandSkillName}`;
    updateHud();
  }

  function targetEnemyAt(pos) {
    return living("enemy")
      .slice()
      .reverse()
      .find((enemy) => distance(pos, enemy) <= enemy.radius + 12) ?? null;
  }

  function installBombOnEnemy(enemy) {
    const targeting = battle.commandSkillTargeting;
    if (!targeting || targeting.mode !== "enemy-bomb" || !enemy || enemy.team !== "enemy" || enemy.hp <= 0 || enemy.removed) return false;
    const caster = battle.medals.find((medal) => medal.id === targeting.casterId);
    if (!caster) return false;

    battle.bomb = {
      casterId: caster.id,
      targetId: enemy.id,
      radius: caster.commandSkillBombRadius,
      hits: caster.commandSkillBombHits,
      damageMultiplier: caster.commandSkillDamage,
      attack: caster.attack,
      countDelay: caster.commandSkillBombCountDelay,
      dodgeExpiresAtHand: battle.hand + caster.commandSkillBombDodgeHands + 1,
    };
    battle.commandSkillTargeting = null;
    phaseText.textContent = `${enemy.id} に爆弾設置`;
    addLog(`${caster.id} 爆弾設置 -> ${enemy.id}`);
    updateHud();
    return true;
  }

  function startRushOnEnemy(enemy) {
    const targeting = battle.commandSkillTargeting;
    if (!targeting || targeting.mode !== "enemy-rush" || !enemy || enemy.team !== "enemy" || enemy.hp <= 0 || enemy.removed) return false;
    const caster = battle.medals.find((medal) => medal.id === targeting.casterId);
    if (!caster) return false;

    battle.commandSkillTargeting = null;
    startRushStrike(caster, enemy, "initial");
    addLog(`${caster.id} 連撃開始 -> ${enemy.id}`);
    updateHud();
    return true;
  }

  function clampPointInsideField(pos) {
    return {
      x: Math.max(field.padding, Math.min(field.width - field.padding, pos.x)),
      y: Math.max(field.padding, Math.min(field.height - field.padding, pos.y)),
    };
  }

  function detonatePointBombAt(pos) {
    const targeting = battle.commandSkillTargeting;
    if (!targeting || targeting.mode !== "point-bomb") return false;
    const caster = battle.medals.find((medal) => medal.id === targeting.casterId);
    if (!caster) return false;
    const center = clampPointInsideField(pos);

    battle.commandSkillTargeting = null;
    battle.bombExplosionEffect = {
      kind: "point-bomb",
      casterId: caster.id,
      attack: caster.attack,
      x: center.x,
      y: center.y,
      radius: caster.commandSkillBombRadius,
      areaLabel: caster.commandSkillAreaLabel,
      hits: caster.commandSkillBombHits,
      damageMultiplier: caster.commandSkillDamage,
      countDelay: caster.commandSkillBombCountDelay,
      defenseIgnore: caster.commandSkillDefenseIgnore,
      csGainPerDefeat: caster.commandSkillCsGainPerDefeat,
      stopCaughtEnemies: false,
      appliedHits: 0,
      countDelayedIds: new Set(),
      defeatedForGaugeIds: new Set(),
      defeatedIds: new Set(),
      elapsed: -POINT_BOMB_ARM_SECONDS,
      duration: 0.86,
    };
    addLog(`${caster.id} 地点爆破`);
    phaseText.textContent = `${caster.id} ${caster.commandSkillName}`;
    updateHud();
    return true;
  }

  function timeStopActorMedal() {
    if (!battle.timeStop?.actorId) return null;
    return battle.medals.find((medal) => medal.id === battle.timeStop.actorId && medal.team === "ally" && medal.hp > 0) ?? null;
  }

  function stopMedalMotion(medal) {
    medal.vx = 0;
    medal.vy = 0;
    medal.moving = false;
    medal.activeShot = false;
    medal.bumpMoving = false;
    medal.rushBlowaway = false;
    medal.rushDecelerating = false;
    medal.rushDecelElapsed = 0;
    medal.remainingDistance = 0;
    medal.currentSpeed = 0;
    medal.shotElapsed = 0;
    medal.bumpElapsed = 0;
    medal.bumpStartVx = 0;
    medal.bumpStartVy = 0;
  }

  function stopAllMedalMotion(exceptId = null) {
    for (const medal of battle.medals) {
      if (!isOnBoard(medal) || medal.id === exceptId) continue;
      stopMedalMotion(medal);
    }
  }

  function startRushStrike(actor, target, reason = "initial") {
    if (!actor || !target || target.removed || target.hp <= 0) return false;
    debugD("start rush", { reason, actor: actor.id, target: target.id, hp: target.hp });
    stopMedalMotion(target);
    actor.activeShot = true;
    actor.moving = false;
    battle.movingMedal = actor;
    battle.rushBlowaway = null;
    battle.commandSkillTargeting = null;
    battle.rushEffect = {
      kind: "rush-strike",
      actorId: actor.id,
      targetId: target.id,
      reason,
      name: actor.commandSkillName,
      hits: actor.commandSkillRushHits,
      damageMultiplier: actor.commandSkillRushDamage,
      ignoreDefense: actor.commandSkillDefenseIgnore,
      elapsed: 0,
      duration: RUSH_HIT_WINDUP_SECONDS + actor.commandSkillRushHits * RUSH_HIT_INTERVAL + RUSH_EFFECT_TAIL_SECONDS,
      appliedHits: 0,
      timeStopQueued: false,
    };
    phaseText.textContent = `${actor.id} ドゴドゴ連撃`;
    return true;
  }

  function startTimeStopFinalStrike(actor) {
    battle.rushEffect = {
      kind: "time-stop-final",
      actorId: actor.id,
      targetIds: living("enemy").map((enemy) => enemy.id),
      name: actor.commandSkillName,
      hits: actor.commandSkillFinishHits,
      damageMultiplier: actor.commandSkillFinishDamage,
      ignoreDefense: false,
      elapsed: 0,
      duration: RUSH_HIT_WINDUP_SECONDS + actor.commandSkillFinishHits * RUSH_HIT_INTERVAL + RUSH_EFFECT_TAIL_SECONDS,
      appliedHits: 0,
    };
    phaseText.textContent = `${actor.id} 時間停止解除`;
  }

  function updateRushEffect(dt) {
    const effect = battle.rushEffect;
    if (!effect) return;

    effect.elapsed += dt;
    while (
      effect.appliedHits < effect.hits
      && effect.elapsed >= RUSH_HIT_WINDUP_SECONDS + effect.appliedHits * RUSH_HIT_INTERVAL
    ) {
      applyRushHit(effect, effect.appliedHits);
      effect.appliedHits += 1;
    }

    if (effect.elapsed < effect.duration) return;

    while (effect.appliedHits < effect.hits) {
      applyRushHit(effect, effect.appliedHits);
      effect.appliedHits += 1;
    }
    finishRushEffect(effect);
  }

  function applyRushHit(effect, hitIndex) {
    const actor = battle.medals.find((medal) => medal.id === effect.actorId);
    if (!actor) return;
    if (hitIndex === 0) {
      awardEffectCombo(effect, effect.hits, {
        duration: effect.hits * RUSH_HIT_INTERVAL,
      });
    }
    const targets = effect.kind === "time-stop-final"
      ? effect.targetIds
        .map((id) => battle.medals.find((medal) => medal.id === id && medal.team === "enemy" && !medal.removed && medal.hp > 0))
        .filter(Boolean)
      : [battle.medals.find((medal) => medal.id === effect.targetId && medal.team === "enemy" && !medal.removed && medal.hp > 0)].filter(Boolean);
    for (const enemy of targets) {
      const damage = calculateDamage(actor, enemy, effect.damageMultiplier, { ignoreDefense: effect.ignoreDefense });
      applyDamage(actor, enemy, damage, "CS連撃", { stackIndex: hitIndex, announceDefeat: false });
    }
  }

  function finishRushEffect(effect) {
    battle.rushEffect = null;
    const actor = battle.medals.find((medal) => medal.id === effect.actorId);
    if (!actor) return;
    if (effect.kind === "rush-strike") {
      debugD("finish rush effect", {
        reason: effect.reason,
        target: effect.targetId,
        queued: effect.timeStopQueued,
      });
    }

    if (effect.kind === "time-stop-final") {
      finishTimeStopRelease(actor);
      return;
    }

    const target = battle.medals.find((medal) => medal.id === effect.targetId);
    if (effect.timeStopQueued) {
      enterTimeStop(actor);
    } else if (target && isOnBoard(target)) {
      startRushBlowaway(actor, target);
    } else {
      enterTimeStop(actor);
    }
  }

  function startRushBlowaway(actor, target) {
    const dx = target.x - actor.x;
    const dy = target.y - actor.y;
    const len = Math.hypot(dx, dy) || 1;
    const speed = Math.max(DEFAULT_MOVE_SPEED * 1.05, actor.moveSpeed);
    target.rushBlowaway = true;
    target.activeShot = true;
    target.bumpMoving = false;
    target.moving = true;
    target.currentSpeed = speed;
    target.remainingDistance = actor.moveDistance;
    target.rushDecelerating = false;
    target.rushDecelElapsed = 0;
    target.vx = (dx / len) * speed;
    target.vy = (dy / len) * speed;
    actor.activeShot = false;
    actor.moving = false;
    battle.movingMedal = actor;
    battle.rushBlowaway = {
      actorId: actor.id,
      targetId: target.id,
      elapsed: 0,
      traveledDistance: 0,
    };
    debugD("start blowaway", { actor: actor.id, target: target.id, hp: target.hp, distance: target.remainingDistance });
    phaseText.textContent = `${target.id} 吹き飛ばし中`;
  }

  function tryResolveRushBlowawayActorContact(blown) {
    if (!battle.rushBlowaway || battle.rushBlowaway.targetId !== blown.id) return false;
    const actor = battle.medals.find((medal) => medal.id === battle.rushBlowaway.actorId);
    if (!actor || !isOnBoard(actor) || !isOnBoard(blown)) return false;

    const dx = blown.x - actor.x;
    const dy = blown.y - actor.y;
    const dist = Math.hypot(dx, dy) || 0.0001;
    const minDist = actor.radius + blown.radius;
    const state = battle.rushBlowaway;
    const armed = state.elapsed >= 0.08 || state.traveledDistance >= Math.min(48, actor.radius * 0.85);
    if (!armed || dist > minDist + 8) return false;

    const key = pairKey(actor, blown);
    const contactX = dx / dist;
    const contactY = dy / dist;
    const wasLocked = battle.contactLocks.has(key);
    if (blown.defeatPending || blown.hp <= 0) {
      if (wasLocked) return true;
      debugD("defeated contact", { target: blown.id, dist });
      spawnImpactEffect(
        blown.x - contactX * blown.radius,
        blown.y - contactY * blown.radius,
        -contactX,
        -contactY,
        1.35,
      );
      addCsGauge(1);
      addCombo(1);
      bounceRushBlowaway(blown, -contactX, -contactY, 0.22);
      battle.contactLocks.set(key, 0.12);
      return true;
    }

    spawnImpactEffect(
      blown.x - contactX * blown.radius,
      blown.y - contactY * blown.radius,
      -contactX,
      -contactY,
      1.35,
    );
    addCsGauge(1);
    battle.contactLocks.delete(key);
    battle.collisionMemory.delete(`${actor.id}->${blown.id}`);
    battle.collisionMemory.delete(`${blown.id}->${actor.id}`);

    debugD("live recontact", { target: blown.id, dist });
    startRushStrike(actor, blown, "loop");
    return true;
  }

  function enterTimeStopFromBlowaway() {
    if (!battle.rushBlowaway) return false;
    const actor = battle.medals.find((medal) => medal.id === battle.rushBlowaway.actorId);
    if (!actor) return false;
    enterTimeStop(actor);
    return true;
  }

  function enterTimeStop(actor) {
    debugD("enter time stop", { actor: actor.id });
    stopAllMedalMotion(actor.id);
    stopMedalMotion(actor);
    battle.rushBlowaway = null;
    battle.commandSkillArmedId = null;
    battle.commandSkillStandbyId = null;
    battle.timeStop = {
      active: true,
      releasing: false,
      actorId: actor.id,
      originalAttackModifier: actor.attackModifier ?? 1,
      originalMoveDistance: actor.moveDistance,
      auraHitIds: new Set(),
      contactHitIds: new Set(),
      directContactIds: new Set(),
    };
    actor.attackModifier = (actor.attackModifier ?? 1) + actor.commandSkillAttackAdd;
    actor.moveDistance = Math.round(actor.moveDistance * TIME_STOP_MOVE_MULTIPLIER);
    resetCombo();
    battle.timeStopEffect = {
      mode: "enter",
      x: actor.x,
      y: actor.y,
      endRadius: actor.radius,
      elapsed: 0,
      duration: TIME_STOP_ENTER_SECONDS,
    };
    battle.phase = "ally";
    battle.activeId = actor.id;
    battle.movingMedal = null;
    phaseText.textContent = `${actor.id} 時間停止`;
    addLog(`${actor.id} 時間停止`);
    updateHud();
  }

  function triggerTimeStopSmash() {
    if (!battle.timeStop?.active || battle.timeStop.releasing) return false;
    if (!battle.movingMedal || battle.movingMedal.id !== battle.timeStop.actorId) return false;
    const smashed = triggerSmash();
    if (smashed) startTimeStopRelease();
    return smashed;
  }

  function startTimeStopRelease() {
    const actor = timeStopActorMedal();
    if (!actor || !battle.timeStop?.active || battle.timeStop.releasing) return false;
    stopAllMedalMotion(actor.id);
    stopMedalMotion(actor);
    battle.timeStop.releasing = true;
    battle.movingMedal = actor;
    battle.timeStopEffect = {
      mode: "release",
      x: actor.x,
      y: actor.y,
      endRadius: 1,
      elapsed: 0,
      duration: TIME_STOP_RELEASE_SECONDS,
    };
    startTimeStopFinalStrike(actor);
    addLog(`${actor.id} 時間停止解除`);
    return true;
  }

  function finishTimeStopRelease(actor) {
    restoreTimeStopActor(actor);
    battle.timeStop = null;
    battle.timeStopEffect = null;
    battle.movingMedal = actor;
    const defeated = pendingDefeatedMedals();
    if (defeated.length > 0 && !battle.defeatEffect) startDefeatEffect(defeated, "announce");
    updateHud();
  }

  function restoreTimeStopActor(actor) {
    if (!battle.timeStop || !actor) return;
    actor.attackModifier = battle.timeStop.originalAttackModifier;
    actor.moveDistance = battle.timeStop.originalMoveDistance;
  }

  function updateTimeStopEffect(dt) {
    if (!battle.timeStopEffect) return;
    battle.timeStopEffect.elapsed += dt;
    if (battle.timeStopEffect.elapsed >= battle.timeStopEffect.duration) {
      battle.timeStopEffect = null;
    }
  }

  function resetTimeStopHitLocks() {
    if (!battle.timeStop) return;
    battle.timeStop.auraHitIds.clear();
    battle.timeStop.contactHitIds.clear();
    battle.timeStop.directContactIds.clear();
  }

  function updateTimeStopAuraDamage() {
    const actor = timeStopActorMedal();
    if (!actor || !battle.timeStop?.active || battle.timeStop.releasing || !actor.moving) return;
    const radius = actor.commandSkillAuraRadius;
    for (const enemy of living("enemy")) {
      const inAura = distance(actor, enemy) <= radius + enemy.radius;
      if (!inAura) {
        battle.timeStop.auraHitIds.delete(enemy.id);
        continue;
      }
      if (battle.timeStop.auraHitIds.has(enemy.id)) continue;
      battle.timeStop.auraHitIds.add(enemy.id);
      applyTimeStopDamage(actor, enemy, "周囲ダメージ");
    }
  }

  function applyTimeStopContactDamage(actor, enemy) {
    if (!battle.timeStop || enemy.defeatPending || enemy.hp <= 0) return;
    if (battle.timeStop.contactHitIds.has(enemy.id)) return;
    battle.timeStop.contactHitIds.add(enemy.id);
    applyTimeStopDamage(actor, enemy, "接触ダメージ");
  }

  function registerTimeStopDirectContact(actor, enemy, contactX, contactY, key) {
    if (!battle.timeStop || enemy.team !== "enemy" || enemy.removed) return;
    if (battle.timeStop.directContactIds.has(enemy.id)) return;
    battle.timeStop.directContactIds.add(enemy.id);
    const speed = Math.hypot(actor.vx, actor.vy);
    spawnImpactEffect(
      actor.x + contactX * actor.radius,
      actor.y + contactY * actor.radius,
      contactX,
      contactY,
      Math.max(0.75, Math.min(1.55, speed / DEFAULT_MOVE_SPEED)),
    );
    if (enemy.defeatPending || enemy.hp <= 0) addCombo(1);
    battle.contactLocks.set(key, 0.12);
  }

  function applyTimeStopDamage(actor, enemy, label) {
    const damage = calculateDamage(actor, enemy);
    addCombo(1);
    applyDamage(actor, enemy, damage, label);
    spawnDogoBurst(enemy, 1.2);
  }

  function onPointerDown(event) {
    if (isInputBlocked()) {
      event.preventDefault();
      return;
    }
    if (battle.detailOpen) {
      hidePartyDetail();
      event.preventDefault();
      return;
    }
    if (battle.reinforcementEffect) {
      event.preventDefault();
      return;
    }
    const pos = pointerPosition(event);
    if (!isInsidePlayField(pos)) return;
    if (battle.rushEffect?.kind === "rush-strike") {
      battle.rushEffect.timeStopQueued = true;
      phaseText.textContent = "時間停止予約";
      event.preventDefault();
      return;
    }
    if (tryDetonateBomb()) {
      event.preventDefault();
      return;
    }
    if (battle.commandSkillTargeting) {
      if (battle.commandSkillTargeting.mode === "point-bomb") {
        detonatePointBombAt(pos);
      } else {
        const enemy = targetEnemyAt(pos);
        if (enemy) {
          if (battle.commandSkillTargeting.mode === "enemy-rush") startRushOnEnemy(enemy);
          else installBombOnEnemy(enemy);
        }
      }
      event.preventDefault();
      return;
    }
    if (battle.movingMedal) {
      let usedAction = false;
      if (battle.rushBlowaway) usedAction = enterTimeStopFromBlowaway();
      else if (battle.timeStop?.active && battle.movingMedal.id === battle.timeStop.actorId) usedAction = triggerTimeStopSmash();
      else usedAction = isCommandSkillArmed(battle.movingMedal)
        ? triggerCommandSkill()
        : triggerSmash();
      if (usedAction) event.preventDefault();
      return;
    }
    if (battle.phase !== "ally" || battle.movingMedal || living("enemy").length === 0) return;
    const picked = readyAllies().find((m) => distance(pos, m) <= m.radius + 24);
    if (picked) {
      battle.activeId = picked.id;
      if (battle.commandSkillStandbyId !== picked.id) battle.commandSkillStandbyId = null;
      chooseNextActive();
      updateHud();
    }

    const medal = activeMedal();
    if (!medal) return;
    const directDrag = distance(pos, medal) <= medal.radius + 22;
    battle.dragging = true;
    battle.dragStart = { x: medal.x, y: medal.y };
    battle.dragPointerStart = pos;
    battle.dragPointerNow = pos;
    battle.dragPointerId = event.pointerId ?? null;
    battle.dragRemote = !directDrag;
    battle.dragPickedId = picked?.id ?? null;
    battle.dragOutsideField = false;
    battle.dragNow = battle.dragRemote ? remoteDragPosition(medal, pos) : clampDrag(medal, pos);
    if (event.pointerId != null && canvas.setPointerCapture) {
      try {
        canvas.setPointerCapture(event.pointerId);
      } catch {
        // Some browsers reject capture after unusual pointer transitions.
      }
    }
    event.preventDefault();
  }

  function onPointerMove(event) {
    if (!battle.dragging) return;
    const medal = activeMedal();
    if (!medal) {
      clearDragState(event);
      return;
    }
    const pos = pointerPosition(event);
    battle.dragPointerNow = pos;
    battle.dragOutsideField = !isInsidePlayField(pos);
    if (battle.dragOutsideField) {
      battle.dragNow = null;
      event.preventDefault();
      return;
    }
    battle.dragNow = battle.dragRemote ? remoteDragPosition(medal, pos) : clampDrag(medal, pos);
    event.preventDefault();
  }

  function onPointerUp(event) {
    if (!battle.dragging) return;
    const pos = pointerPosition(event);
    battle.dragPointerNow = pos;
    battle.dragOutsideField = !isInsidePlayField(pos);
    if (battle.dragOutsideField) clearDragState(event);
    else launchActive(event);
    event.preventDefault();
  }

  function onPointerCancel(event) {
    if (!battle.dragging) return;
    clearDragState(event);
    event.preventDefault();
  }

  function updateMedal(medal, dt) {
    if (!medal.moving) return;

    if (battle.timeStop?.active && medal.id !== battle.timeStop.actorId) {
      stopMedalMotion(medal);
      return;
    }

    if (medal.rushBlowaway) {
      const baseSpeed = medal.currentSpeed || DEFAULT_MOVE_SPEED;
      const decelDistance = baseSpeed * RUSH_BLOWAWAY_DECEL_SECONDS * 0.5;
      if (!medal.rushDecelerating && medal.remainingDistance <= decelDistance) {
        medal.rushDecelerating = true;
        medal.rushDecelElapsed = 0;
      }
      let speed = baseSpeed;
      if (medal.rushDecelerating) {
        medal.rushDecelElapsed += dt;
        const progress = Math.min(1, medal.rushDecelElapsed / RUSH_BLOWAWAY_DECEL_SECONDS);
        speed = baseSpeed * Math.max(0, 1 - progress);
      }
      const angle = Math.atan2(medal.vy, medal.vx);
      medal.vx = Math.cos(angle) * speed;
      medal.vy = Math.sin(angle) * speed;
      const stepDistance = speed * dt;
      medal.remainingDistance -= stepDistance;
      if (battle.rushBlowaway?.targetId === medal.id) {
        battle.rushBlowaway.elapsed += dt;
        battle.rushBlowaway.traveledDistance += stepDistance;
      }
    } else if (medal.activeShot) {
      medal.shotElapsed += dt;
      const speed = currentShotTargetSpeed(medal);

      const angle = Math.atan2(medal.vy, medal.vx);
      medal.vx = Math.cos(angle) * speed;
      medal.vy = Math.sin(angle) * speed;

      const stepDistance = speed * dt;
      medal.remainingDistance -= stepDistance;
      if (medal.shotElapsed >= medal.constantTravelTime + medal.decelDuration || speed < 5) {
        medal.vx = 0;
        medal.vy = 0;
        medal.moving = false;
        medal.activeShot = false;
        if (battle.movingMedal === medal) {
          phaseText.textContent = "弾かれたメダルの収束待ち";
        }
        return;
      }
    } else if (medal.bumpMoving) {
      medal.bumpElapsed += dt;
      const progress = Math.min(1, medal.bumpElapsed / medal.bumpDuration);
      const damping = Math.max(0, (1 - progress) ** 0.82);
      medal.vx = medal.bumpStartVx * damping;
      medal.vy = medal.bumpStartVy * damping;
      if (progress >= 1 || Math.hypot(medal.vx, medal.vy) < 6) {
        medal.vx = 0;
        medal.vy = 0;
        medal.moving = false;
        medal.bumpMoving = false;
        medal.bumpElapsed = 0;
        medal.bumpStartVx = 0;
        medal.bumpStartVy = 0;
      }
    } else {
      medal.vx *= Math.pow(0.08, dt);
      medal.vy *= Math.pow(0.08, dt);
      if (Math.hypot(medal.vx, medal.vy) < 6) {
        medal.vx = 0;
        medal.vy = 0;
        medal.moving = false;
      }
    }

    medal.x += medal.vx * dt;
    medal.y += medal.vy * dt;
    collideWall(medal);
    if (medal.rushBlowaway && tryResolveRushBlowawayActorContact(medal)) return;
    if (
      medal.rushBlowaway
      && (
        medal.remainingDistance <= 2
        || (medal.rushDecelerating && medal.rushDecelElapsed >= RUSH_BLOWAWAY_DECEL_SECONDS)
        || Math.hypot(medal.vx, medal.vy) < 8
      )
    ) {
      stopMedalMotion(medal);
      if (battle.rushBlowaway?.targetId === medal.id) {
        finishRushBlowawayState("distance");
      }
    }
  }

  function currentShotTargetSpeed(medal) {
    if (!medal.activeShot) return Math.hypot(medal.vx, medal.vy);
    if (medal.shotElapsed < medal.constantTravelTime) return medal.currentSpeed;
    const decelElapsed = medal.shotElapsed - medal.constantTravelTime;
    const progress = Math.min(1, decelElapsed / medal.decelDuration);
    return medal.currentSpeed * Math.max(0, 1 - progress);
  }

  function keepSpeedIfShot(medal) {
    if (!medal.activeShot) return;
    const speed = Math.hypot(medal.vx, medal.vy);
    if (speed < 0.001) return;
    const target = currentShotTargetSpeed(medal);
    medal.vx = (medal.vx / speed) * target;
    medal.vy = (medal.vy / speed) * target;
  }

  function setBumpVelocity(target, vx, vy, duration = BUMP_STOP_SECONDS) {
    target.vx = vx;
    target.vy = vy;
    target.bumpStartVx = vx;
    target.bumpStartVy = vy;
    target.moving = true;
    target.bumpMoving = true;
    target.bumpElapsed = 0;
    target.bumpDuration = duration;
  }

  function rotateVector(x, y, angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return {
      x: x * cos - y * sin,
      y: x * sin + y * cos,
    };
  }

  function spawnImpactEffect(x, y, normalX, normalY, intensity = 1) {
    if (![x, y, normalX, normalY].every(Number.isFinite)) return;

    const normalLength = Math.hypot(normalX, normalY) || 1;
    const nx = normalX / normalLength;
    const ny = normalY / normalLength;
    const tx = -ny;
    const ty = nx;
    const sparkCount = Math.max(5, Math.min(14, Math.round(6 + intensity * 5)));
    const baseSpeed = 150 + intensity * 125;
    const colors = ["#fff2a6", "#ffd36a", "#ff9c4b", "#ffffff"];

    for (let i = 0; i < sparkCount; i += 1) {
      const spread = (Math.random() - 0.5) * 1.25;
      const backScatter = Math.random() < 0.28 ? -0.45 : 1;
      const speed = baseSpeed * (0.45 + Math.random() * 0.9);
      const vx = (nx * backScatter + tx * spread) * speed;
      const vy = (ny * backScatter + ty * spread) * speed;
      battle.impactEffects.push({
        x: x + (Math.random() - 0.5) * 5,
        y: y + (Math.random() - 0.5) * 5,
        vx,
        vy,
        age: 0,
        duration: IMPACT_EFFECT_SECONDS * (0.72 + Math.random() * 0.45),
        size: (2.2 + Math.random() * 3.2) * IMPACT_SPARK_SIZE_SCALE,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    if (battle.impactEffects.length > MAX_IMPACT_PARTICLES) {
      battle.impactEffects.splice(0, battle.impactEffects.length - MAX_IMPACT_PARTICLES);
    }
  }

  function spawnWallImpact(medal, x, y, normalX, normalY, sideKey) {
    const speed = Math.hypot(medal.vx, medal.vy);
    if (speed < 18) return;

    const key = `${medal.id}:wall:${sideKey}`;
    if ((battle.impactCooldowns.get(key) ?? 0) > 0) return;

    battle.impactCooldowns.set(key, 0.085);
    const intensity = Math.max(0.55, Math.min(1.45, speed / DEFAULT_MOVE_SPEED));
    spawnImpactEffect(x, y, normalX, normalY, intensity);
  }

  function updateImpactEffects(dt) {
    for (const [key, cooldown] of battle.impactCooldowns.entries()) {
      const next = cooldown - dt;
      if (next <= 0) battle.impactCooldowns.delete(key);
      else battle.impactCooldowns.set(key, next);
    }

    for (const effect of battle.impactEffects) {
      effect.age += dt;
      effect.x += effect.vx * dt;
      effect.y += effect.vy * dt;
      effect.vx *= Math.pow(0.04, dt);
      effect.vy *= Math.pow(0.04, dt);
    }
    battle.impactEffects = battle.impactEffects.filter((effect) => effect.age < effect.duration);
  }

  function spawnDogoBurst(target, scale = 1) {
    for (const pos of dogoPositions()) {
      battle.dogoEffects.push({
        x: target.x + pos.x * target.radius,
        y: target.y + pos.y * target.radius,
        rotation: pos.r,
        age: -pos.index * RUSH_DOGO_STEP_SECONDS,
        duration: RUSH_DOGO_DURATION_SECONDS,
        scale,
        index: pos.index,
      });
    }
    if (battle.dogoEffects.length > 48) battle.dogoEffects.splice(0, battle.dogoEffects.length - 48);
  }

  function spawnSingleDogo(target, index, scale = 1) {
    const pos = dogoPositions()[index % dogoPositions().length];
    battle.dogoEffects.push({
      x: target.x + pos.x * target.radius,
      y: target.y + pos.y * target.radius,
      rotation: pos.r,
      age: 0,
      duration: RUSH_DOGO_DURATION_SECONDS,
      scale,
      index: pos.index,
    });
    if (battle.dogoEffects.length > 48) battle.dogoEffects.splice(0, battle.dogoEffects.length - 48);
  }

  function dogoPositions() {
    return [
      { x: -0.58, y: 0.58, r: 0.18, index: 0 },
      { x: 0.7, y: -0.52, r: 0.2, index: 1 },
      { x: -0.78, y: -0.62, r: -0.22, index: 2 },
      { x: 0.62, y: 0.52, r: -0.18, index: 3 },
      { x: 0, y: 0, r: 0, index: 4 },
    ];
  }

  function updateDogoEffects(dt) {
    for (const effect of battle.dogoEffects) effect.age += dt;
    battle.dogoEffects = battle.dogoEffects.filter((effect) => effect.age < effect.duration);
  }

  function spawnDamageNumber(medal, damage, yOffset = 0, stackIndex = null) {
    const stackSlot = Number.isFinite(stackIndex)
      ? Math.max(0, Math.trunc(stackIndex)) % DAMAGE_NUMBER_STACK_MAX
      : 0;
    battle.damageNumbers.push({
      x: medal.x,
      y: medal.y - medal.radius * 0.45 - stackSlot * DAMAGE_NUMBER_STACK_STEP + yOffset,
      value: damage,
      age: 0,
      duration: DAMAGE_NUMBER_SECONDS,
      team: medal.team,
    });

    if (battle.damageNumbers.length > MAX_DAMAGE_NUMBERS) {
      battle.damageNumbers.splice(0, battle.damageNumbers.length - MAX_DAMAGE_NUMBERS);
    }
  }

  function updateDamageNumbers(dt) {
    for (const number of battle.damageNumbers) {
      number.age += dt;
    }
    battle.damageNumbers = battle.damageNumbers.filter((number) => number.age < number.duration);
  }

  function spawnDodgeEffect(ally, enemy) {
    const speed = Math.hypot(enemy.vx, enemy.vy);
    const dirX = speed > 0.001 ? enemy.vx / speed : 1;
    const dirY = speed > 0.001 ? enemy.vy / speed : 0;
    battle.dodgeEffects.push({
      x: ally.x,
      y: ally.y,
      dirX,
      dirY,
      radius: ally.radius,
      elapsed: 0,
      duration: DODGE_EFFECT_SECONDS,
    });
    if (battle.dodgeEffects.length > 12) battle.dodgeEffects.splice(0, battle.dodgeEffects.length - 12);
  }

  function updateDodgeEffects(dt) {
    for (const effect of battle.dodgeEffects) effect.elapsed += dt;
    battle.dodgeEffects = battle.dodgeEffects.filter((effect) => effect.elapsed < effect.duration);
  }

  function updateOneMoreEffect(dt) {
    if (!battle.oneMoreEffect) return;
    battle.oneMoreEffect.elapsed += dt;
    if (battle.oneMoreEffect.elapsed >= battle.oneMoreEffect.duration) battle.oneMoreEffect = null;
  }

  function updateNextTurnEffect(dt) {
    if (!battle.nextTurnEffect) return;
    battle.nextTurnEffect.elapsed += dt;
    if (battle.nextTurnEffect.elapsed >= battle.nextTurnEffect.duration) battle.nextTurnEffect = null;
  }

  function updateBombClickEffect(dt) {
    if (!battle.bombClickEffect) return;
    battle.bombClickEffect.elapsed += dt;
    if (battle.bombClickEffect.elapsed >= battle.bombClickEffect.duration) battle.bombClickEffect = null;
  }

  function updateSmashEffect(dt) {
    if (!battle.smashEffect) return;
    battle.smashEffect.elapsed += dt;
    if (battle.smashEffect.elapsed >= battle.smashEffect.duration) {
      battle.smashEffect = null;
    }
  }

  function isBombDetonationWindow() {
    return Boolean(
      battle.phase === "enemy-moving"
      && battle.movingMedal
      && battle.movingMedal.team === "enemy"
      && battle.movingMedal.activeShot
    );
  }

  function tryDetonateBomb() {
    if (!battle.bomb || battle.bombExplosionEffect || !isBombDetonationWindow()) return false;
    const target = battle.medals.find((medal) => medal.id === battle.bomb.targetId);
    if (!target || target.removed || target.hp <= 0 || target.defeatPending) {
      clearBomb();
      return false;
    }

    battle.bombClickEffect = {
      x: target.x,
      y: target.y,
      radius: target.radius,
      elapsed: 0,
      duration: BOMB_CLICK_EFFECT_SECONDS,
    };
    battle.bombExplosionEffect = {
      casterId: battle.bomb.casterId,
      attack: battle.bomb.attack,
      x: target.x,
      y: target.y,
      radius: battle.bomb.radius,
      hits: battle.bomb.hits,
      damageMultiplier: battle.bomb.damageMultiplier,
      countDelay: battle.bomb.countDelay,
      stopCaughtEnemies: true,
      appliedHits: 0,
      countDelayedIds: new Set(),
      defeatedForGaugeIds: new Set(),
      defeatedIds: new Set(),
      elapsed: -BOMB_EXPLOSION_DELAY,
      duration: BOMB_EXPLOSION_SECONDS,
    };
    addLog(`${target.id} 爆弾起爆`);
    phaseText.textContent = "カチッ...爆発";
    battle.bomb = null;
    updateHud();
    return true;
  }

  function updateBombExplosionEffect(dt) {
    const effect = battle.bombExplosionEffect;
    if (!effect) return;

    effect.elapsed += dt;
    if (effect.elapsed < 0) return;
    const hitStart = effect.hitStart ?? BOMB_EXPLOSION_HIT_START;
    const hitInterval = effect.hitInterval ?? BOMB_EXPLOSION_HIT_INTERVAL;
    while (
      effect.appliedHits < effect.hits
      && effect.elapsed >= hitStart + effect.appliedHits * hitInterval
    ) {
      applyBombHit(effect, effect.appliedHits);
      effect.appliedHits += 1;
    }

    if (effect.finishDamageOnHitsComplete && effect.appliedHits >= effect.hits && !effect.damageComplete) {
      completeBombExplosionDamage(effect);
    }

    if (effect.elapsed >= effect.duration) {
      while (effect.appliedHits < effect.hits) {
        applyBombHit(effect, effect.appliedHits);
        effect.appliedHits += 1;
      }
      battle.bombExplosionEffect = null;
      if (!effect.damageComplete) completeBombExplosionDamage(effect);
    }
  }

  function updateWallTrapEffects(dt) {
    if (battle.wallTrapEffects.length === 0) return;
    battle.wallTrapEffects = battle.wallTrapEffects.filter((effect) => {
      effect.elapsed += dt;
      return effect.elapsed < effect.duration;
    });
  }

  function updateWallTrapHitStop(dt) {
    if (battle.wallTrapHitStop <= 0) return false;
    battle.wallTrapHitStop = Math.max(0, battle.wallTrapHitStop - dt);
    return true;
  }

  function completeBombExplosionDamage(effect) {
    effect.damageComplete = true;
    const defeated = effect.defeatedIds
      ? battle.medals.filter((medal) => effect.defeatedIds.has(medal.id) && medal.defeatPending && !medal.removed)
      : pendingDefeatedMedals();
    traceEvent("bomb-effect-complete", {
      kind: effect.kind ?? "bomb",
      triggerEnemy: effect.triggerEnemyId ?? "none",
      hits: effect.appliedHits,
      defeated: defeated.map((medal) => medal.id),
      allPending: pendingDefeatedMedals().map((medal) => medal.id),
    }, { visible: true });
    if (defeated.length > 0 && !battle.defeatEffect) startDefeatEffect(defeated, "announce");
  }

  function applyBombHit(effect, hitIndex) {
    const caster = battle.medals.find((medal) => medal.id === effect.casterId) ?? {
      id: effect.casterId,
      team: "ally",
      attack: effect.attack,
    };
    const targets = living("enemy").filter((enemy) => distance(effect, enemy) <= effect.radius + enemy.radius);
    if (effect.kind === "wall-trap" && hitIndex === 0) {
      awardEffectCombo(effect, effect.hits);
      traceEvent("wall-trap-hit-start", {
        triggerEnemy: effect.triggerEnemyId ?? "none",
        targets: targets.map((enemy) => enemy.id),
        radius: effect.radius,
      }, { visible: true });
    }
    for (const enemy of targets) {
      if (effect.stopCaughtEnemies) stopEnemyFromBomb(enemy);
      delayEnemyCountFromBomb(effect, enemy);
      const damage = calculateDamage(caster, enemy, effect.damageMultiplier, { ignoreDefense: effect.defenseIgnore });
      const defeated = applyDamage(caster, enemy, damage, "爆弾ダメージ", { stackIndex: hitIndex, announceDefeat: false });
      if (defeated) {
        if (!effect.defeatedIds) effect.defeatedIds = new Set();
        effect.defeatedIds.add(enemy.id);
        if (effect.kind === "wall-trap") {
          traceEvent("wall-trap-defeat", {
            triggerEnemy: effect.triggerEnemyId ?? "none",
            enemy: enemy.id,
            hitIndex,
            damage,
          }, { visible: true });
        }
      }
      if (defeated && effect.csGainPerDefeat > 0 && !effect.defeatedForGaugeIds.has(enemy.id)) {
        effect.defeatedForGaugeIds.add(enemy.id);
        addCsGauge(effect.csGainPerDefeat);
        addLog(`CSゲージ +${effect.csGainPerDefeat}`);
      }
    }
  }

  function delayEnemyCountFromBomb(effect, enemy) {
    const countDelay = effect.countDelay ?? 0;
    if (countDelay <= 0) return;
    if (effect.countDelayedIds.has(enemy.id)) return;
    effect.countDelayedIds.add(enemy.id);
    enemy.count = Math.min(ENEMY_COUNT_MAX, Math.max(0, enemy.count) + countDelay);
    battle.enemyQueue = battle.enemyQueue.filter((id) => id !== enemy.id);
    if (countDelay > 0) addLog(`${enemy.id} 行動カウント +${countDelay}`);
  }

  function stopEnemyFromBomb(enemy) {
    enemy.vx = 0;
    enemy.vy = 0;
    enemy.moving = false;
    enemy.activeShot = false;
    enemy.bumpMoving = false;
    enemy.remainingDistance = 0;
    enemy.currentSpeed = 0;
    enemy.shotElapsed = 0;
    enemy.bumpElapsed = 0;
    enemy.bumpStartVx = 0;
    enemy.bumpStartVy = 0;
  }

  function clearBomb() {
    if (!battle.bomb) return;
    addLog("爆弾消滅");
    battle.bomb = null;
    updateHud();
  }

  function cleanupBombIfInvalid() {
    if (!battle.bomb) return;
    const target = battle.medals.find((medal) => medal.id === battle.bomb.targetId);
    if (!target || target.removed || target.hp <= 0 || target.defeatPending) clearBomb();
  }

  function applyCommandSkillEffectDamage(effect) {
    if (!effect || effect.damageApplied) return;
    const caster = battle.medals.find((medal) => medal.id === effect.casterId);
    if (!caster) {
      effect.damageApplied = true;
      return;
    }

    for (const targetId of effect.targetIds) {
      const enemy = battle.medals.find((medal) => medal.id === targetId && medal.team === "enemy" && !medal.removed && medal.hp > 0);
      if (!enemy) continue;
      const damage = calculateDamage(caster, enemy, caster.commandSkillDamage);
      applyDamage(caster, enemy, damage, "CSダメージ");
    }
    effect.damageApplied = true;
  }

  function updateConfusionWallCommandSkillEffect(effect) {
    while (
      effect.appliedHits < effect.hits
      && effect.elapsed >= effect.hitStart + effect.appliedHits * effect.hitInterval
    ) {
      applyConfusionWallHit(effect, effect.appliedHits);
      effect.appliedHits += 1;
    }

    if (effect.elapsed >= effect.duration) {
      while (effect.appliedHits < effect.hits) {
        applyConfusionWallHit(effect, effect.appliedHits);
        effect.appliedHits += 1;
      }
      applyConfusionWallKnockback(effect);
      battle.commandSkillEffect = null;
      const defeated = effect.defeatedIds
        ? battle.medals.filter((medal) => effect.defeatedIds.has(medal.id) && medal.defeatPending && !medal.removed)
        : pendingDefeatedMedals();
      traceEvent("E-CS-complete", {
        caster: effect.casterId,
        hits: effect.appliedHits,
        defeated: defeated.map((medal) => medal.id),
        allPending: pendingDefeatedMedals().map((medal) => medal.id),
      }, { visible: true });
      if (defeated.length > 0 && !battle.defeatEffect) startDefeatEffect(defeated, "announce");
    }
  }

  function applyConfusionWallHit(effect, hitIndex) {
    const caster = battle.medals.find((medal) => medal.id === effect.casterId);
    if (!caster) return;
    if (hitIndex === 0 && effect.targetIds.length > 0) {
      awardEffectCombo(effect, effect.hits, {
        duration: effect.hits * effect.hitInterval,
      });
    }

    for (const targetId of effect.targetIds) {
      const enemy = battle.medals.find((medal) => (
        medal.id === targetId
        && medal.team === "enemy"
        && !medal.removed
        && medal.hp > 0
      ));
      if (!enemy) continue;
      const damage = calculateDamage(caster, enemy, effect.damageMultiplier);
      const defeated = applyDamage(caster, enemy, damage, "混乱連撃", { stackIndex: hitIndex, announceDefeat: false });
      if (defeated) {
        if (!effect.defeatedIds) effect.defeatedIds = new Set();
        effect.defeatedIds.add(enemy.id);
        traceEvent("E-CS-defeat", {
          enemy: enemy.id,
          hitIndex,
          damage,
        }, { visible: true });
      }
    }
  }

  function applyConfusionWallKnockback(effect) {
    if (effect.knockbackApplied) return;
    effect.knockbackApplied = true;
    for (const targetId of effect.targetIds) {
      const enemy = battle.medals.find((medal) => medal.id === targetId && medal.team === "enemy" && isOnBoard(medal));
      if (!enemy || enemy.defeatPending || enemy.hp <= 0) continue;
      let dx = enemy.x - effect.x;
      let dy = enemy.y - effect.y;
      let len = Math.hypot(dx, dy);
      if (len < 0.01) {
        const angle = (Math.PI * 2 * effect.targetIds.indexOf(targetId)) / Math.max(1, effect.targetIds.length);
        dx = Math.cos(angle);
        dy = Math.sin(angle);
        len = 1;
      }
      const nx = dx / len;
      const ny = dy / len;
      setBumpVelocity(
        enemy,
        nx * CONFUSION_WALL_KNOCKBACK_SPEED,
        ny * CONFUSION_WALL_KNOCKBACK_SPEED,
        CONFUSION_WALL_KNOCKBACK_SECONDS,
      );
      spawnImpactEffect(enemy.x - nx * enemy.radius, enemy.y - ny * enemy.radius, nx, ny, 1.35);
    }
  }

  function updateCommandSkillEffect(dt) {
    if (!battle.commandSkillEffect) return;
    const effect = battle.commandSkillEffect;
    effect.elapsed += dt;
    if (effect.type === "confusion-wall") {
      updateConfusionWallCommandSkillEffect(effect);
      return;
    }
    const progress = Math.min(1, effect.elapsed / effect.duration);
    if (!effect.damageApplied && progress >= effect.damageAt) {
      applyCommandSkillEffectDamage(effect);
    }
    if (effect.elapsed >= effect.duration) {
      applyCommandSkillEffectDamage(effect);
      battle.commandSkillEffect = null;
    }
  }

  function updateWallTrapNudges(dt) {
    for (const [key, ttl] of battle.wallTrapCooldowns.entries()) {
      const next = ttl - dt;
      if (next <= 0) battle.wallTrapCooldowns.delete(key);
      else battle.wallTrapCooldowns.set(key, next);
    }

    if (battle.wallTrapNudges.length === 0) return;
    battle.wallTrapNudges = battle.wallTrapNudges.filter((nudge) => {
      nudge.elapsed += dt;
      if (nudge.elapsed < 0) return true;

      const medal = battle.medals.find((item) => item.id === nudge.medalId);
      if (medal && isOnBoard(medal)) {
        medal.x += nudge.normalX * WALL_TRAP_NUDGE_DISTANCE;
        medal.y += nudge.normalY * WALL_TRAP_NUDGE_DISTANCE;
        keepMedalInsideField(medal, false);
      }
      return false;
    });
  }

  function scheduleWallTrapNudge(enemy, normalX, normalY) {
    battle.wallTrapNudges.push({
      medalId: enemy.id,
      normalX,
      normalY,
      elapsed: -(WALL_TRAP_HIT_START + WALL_TRAP_NUDGE_DELAY),
    });
  }

  function triggerWallTrapForEnemy(enemy, normalX, normalY, sideKey) {
    if (
      !hasActiveWallTrap()
      || !enemy
      || enemy.team !== "enemy"
      || enemy.removed
      || (enemy.hp <= 0 && !enemy.defeatPending)
    ) {
      return false;
    }

    const normalLength = Math.hypot(normalX, normalY) || 1;
    const nx = normalX / normalLength;
    const ny = normalY / normalLength;
    const cooldownKey = `${enemy.id}:${sideKey}`;
    if (battle.wallTrapCooldowns.has(cooldownKey)) return false;
    battle.wallTrapCooldowns.set(cooldownKey, WALL_TRAP_RETRIGGER_COOLDOWN_SECONDS);

    const trap = battle.wallTrap;
    if (battle.movingMedal?.id === enemy.id) {
      battle.pendingActionContext = { actedId: enemy.id, actedTeam: enemy.team };
    }
    traceEvent("wall-trap-trigger", {
      enemy: enemy.id,
      hp: enemy.hp,
      defeatPending: enemy.defeatPending,
      sideKey,
      moving: battle.movingMedal?.id ?? "none",
      pendingSet: battle.pendingActionContext ? `${battle.pendingActionContext.actedId}:${battle.pendingActionContext.actedTeam}` : "none",
      queue: battle.enemyQueue,
    }, { visible: true });
    stopMedalMotion(enemy);
    spawnImpactEffect(enemy.x - nx * enemy.radius, enemy.y - ny * enemy.radius, nx, ny, 1.55);
    scheduleWallTrapNudge(enemy, nx, ny);

    const effect = {
      kind: "wall-trap",
      casterId: trap.casterId,
      attack: trap.attack,
      x: enemy.x,
      y: enemy.y,
      radius: trap.radius,
      hits: trap.hits,
      damageMultiplier: trap.damageMultiplier,
      defenseIgnore: trap.defenseIgnore,
      countDelay: 0,
      csGainPerDefeat: 0,
      stopCaughtEnemies: false,
      appliedHits: 0,
      countDelayedIds: new Set(),
      defeatedForGaugeIds: new Set(),
      defeatedIds: new Set(),
      triggerEnemyId: enemy.id,
      hitStart: WALL_TRAP_HIT_START,
      hitInterval: WALL_TRAP_HIT_INTERVAL,
      finishDamageOnHitsComplete: true,
      elapsed: 0,
      duration: WALL_TRAP_EFFECT_SECONDS,
    };
    phaseText.textContent = "壁停止爆破";
    addLog(`${enemy.id} 壁停止爆破`);
    while (effect.appliedHits < effect.hits) {
      applyBombHit(effect, effect.appliedHits);
      effect.appliedHits += 1;
    }
    completeBombExplosionDamage(effect);
    battle.wallTrapEffects.push(effect);
    battle.wallTrapHitStop = Math.max(battle.wallTrapHitStop, WALL_TRAP_HIT_STOP_SECONDS);

    return true;
  }

  function updateReinforcementEffect(dt) {
    if (!battle.reinforcementEffect) return;
    const effect = battle.reinforcementEffect;
    effect.elapsed += dt;
    for (const id of effect.spawnedIds) {
      const medal = battle.medals.find((m) => m.id === id);
      if (medal?.spawnIntro) {
        medal.spawnIntro.elapsed = Math.min(effect.elapsed, medal.spawnIntro.duration);
      }
    }
    if (effect.elapsed >= effect.duration) {
      for (const id of effect.spawnedIds) {
        const medal = battle.medals.find((m) => m.id === id);
        if (medal) medal.spawnIntro = null;
      }
      const context = effect.context;
      battle.reinforcementEffect = null;
      finishActionAfterReinforcement(context);
    }
  }

  function fieldBoundsFor(medal) {
    return {
      minX: field.padding + medal.radius,
      maxX: field.width - field.padding - medal.radius,
      minY: field.padding + medal.radius,
      maxY: field.height - field.padding - medal.radius,
    };
  }

  function keepMedalInsideField(medal, reflectVelocity) {
    const bounds = fieldBoundsFor(medal);
    let clamped = false;
    let wallTrapTriggered = false;

    if (medal.x < bounds.minX) {
      medal.x = bounds.minX;
      if (reflectVelocity) {
        spawnWallImpact(medal, medal.x - medal.radius, medal.y, 1, 0, "left");
        wallTrapTriggered = triggerWallTrapForEnemy(medal, 1, 0, "left") || wallTrapTriggered;
        if (!wallTrapTriggered) medal.vx = Math.abs(medal.vx);
        if (!wallTrapTriggered && medal.bumpMoving) medal.vx = Math.max(medal.vx, WALL_BOUNCE_MIN_SPEED);
      }
      clamped = true;
    } else if (medal.x > bounds.maxX) {
      medal.x = bounds.maxX;
      if (reflectVelocity) {
        spawnWallImpact(medal, medal.x + medal.radius, medal.y, -1, 0, "right");
        wallTrapTriggered = triggerWallTrapForEnemy(medal, -1, 0, "right") || wallTrapTriggered;
        if (!wallTrapTriggered) medal.vx = -Math.abs(medal.vx);
        if (!wallTrapTriggered && medal.bumpMoving) medal.vx = Math.min(medal.vx, -WALL_BOUNCE_MIN_SPEED);
      }
      clamped = true;
    }

    if (medal.y < bounds.minY) {
      medal.y = bounds.minY;
      if (reflectVelocity) {
        spawnWallImpact(medal, medal.x, medal.y - medal.radius, 0, 1, "top");
        wallTrapTriggered = triggerWallTrapForEnemy(medal, 0, 1, "top") || wallTrapTriggered;
        if (!wallTrapTriggered) medal.vy = Math.abs(medal.vy);
        if (!wallTrapTriggered && medal.bumpMoving) medal.vy = Math.max(medal.vy, WALL_BOUNCE_MIN_SPEED);
      }
      clamped = true;
    } else if (medal.y > bounds.maxY) {
      medal.y = bounds.maxY;
      if (reflectVelocity) {
        spawnWallImpact(medal, medal.x, medal.y + medal.radius, 0, -1, "bottom");
        wallTrapTriggered = triggerWallTrapForEnemy(medal, 0, -1, "bottom") || wallTrapTriggered;
        if (!wallTrapTriggered) medal.vy = -Math.abs(medal.vy);
        if (!wallTrapTriggered && medal.bumpMoving) medal.vy = Math.min(medal.vy, -WALL_BOUNCE_MIN_SPEED);
      }
      clamped = true;
    }

    if (clamped && reflectVelocity && !wallTrapTriggered) {
      if (battle.timeStop?.active && medal.id === battle.timeStop.actorId) {
        resetTimeStopHitLocks();
      }
      if (medal.bumpMoving) {
        medal.bumpStartVx = medal.vx;
        medal.bumpStartVy = medal.vy;
        medal.bumpElapsed = Math.min(medal.bumpElapsed, medal.bumpDuration * 0.45);
      }
      keepSpeedIfShot(medal);
    }
    return clamped;
  }

  function recoverMedalsInsideField() {
    for (const medal of battle.medals) {
      if (!isOnBoard(medal)) continue;
      keepMedalInsideField(medal, medal.moving);
    }
  }

  function collideWall(medal) {
    keepMedalInsideField(medal, true);
  }

  function wallPinchNormal(target, pushX, pushY) {
    const bounds = fieldBoundsFor(target);
    let nx = 0;
    let ny = 0;

    if (target.x <= bounds.minX + WALL_PINCH_MARGIN && pushX < -0.18) nx += 1;
    if (target.x >= bounds.maxX - WALL_PINCH_MARGIN && pushX > 0.18) nx -= 1;
    if (target.y <= bounds.minY + WALL_PINCH_MARGIN && pushY < -0.18) ny += 1;
    if (target.y >= bounds.maxY - WALL_PINCH_MARGIN && pushY > 0.18) ny -= 1;

    const len = Math.hypot(nx, ny);
    if (len < 0.001) return null;
    return { x: nx / len, y: ny / len };
  }

  function applyWallPinchBounce(active, target, pushX, pushY, dirX, dirY) {
    const normal = wallPinchNormal(target, pushX, pushY);
    if (!normal) return false;
    if (triggerWallTrapForEnemy(target, normal.x, normal.y, "pinch")) return true;

    const pushDotWall = pushX * normal.x + pushY * normal.y;
    let tangentX = pushX - normal.x * pushDotWall;
    let tangentY = pushY - normal.y * pushDotWall;
    let tangentLength = Math.hypot(tangentX, tangentY);
    if (tangentLength < 0.001) {
      tangentX = dirX - normal.x * (dirX * normal.x + dirY * normal.y);
      tangentY = dirY - normal.y * (dirX * normal.x + dirY * normal.y);
      tangentLength = Math.hypot(tangentX, tangentY);
    }
    const tangentUnitX = tangentLength > 0.001 ? tangentX / tangentLength : 0;
    const tangentUnitY = tangentLength > 0.001 ? tangentY / tangentLength : 0;
    const targetVx = normal.x * WALL_PINCH_TARGET_POP_SPEED
      + tangentUnitX * WALL_PINCH_TARGET_POP_SPEED * WALL_PINCH_TANGENT_CARRY;
    const targetVy = normal.y * WALL_PINCH_TARGET_POP_SPEED
      + tangentUnitY * WALL_PINCH_TARGET_POP_SPEED * WALL_PINCH_TANGENT_CARRY;
    target.x += normal.x * 3;
    target.y += normal.y * 3;
    keepMedalInsideField(target, false);
    setBumpVelocity(target, targetVx, targetVy, Math.max(BUMP_STOP_SECONDS, 0.44));

    const wallDot = dirX * normal.x + dirY * normal.y;
    let wallBounceX = dirX - 2 * wallDot * normal.x;
    let wallBounceY = dirY - 2 * wallDot * normal.y;
    const wallBounceLength = Math.hypot(wallBounceX, wallBounceY) || 1;
    wallBounceX /= wallBounceLength;
    wallBounceY /= wallBounceLength;

    const contactNormalX = -pushX;
    const contactNormalY = -pushY;
    const contactDot = dirX * contactNormalX + dirY * contactNormalY;
    let contactBounceX = wallBounceX;
    let contactBounceY = wallBounceY;
    if (contactDot < -0.001) {
      contactBounceX = dirX - 2 * contactDot * contactNormalX;
      contactBounceY = dirY - 2 * contactDot * contactNormalY;
      const contactBounceLength = Math.hypot(contactBounceX, contactBounceY) || 1;
      contactBounceX /= contactBounceLength;
      contactBounceY /= contactBounceLength;
    }

    const offCenter = Math.min(1, tangentLength / 0.82);
    const contactBlend = Math.min(WALL_PINCH_CONTACT_BLEND, offCenter * WALL_PINCH_CONTACT_BLEND);
    let bounceX = wallBounceX * (1 - contactBlend) + contactBounceX * contactBlend;
    let bounceY = wallBounceY * (1 - contactBlend) + contactBounceY * contactBlend;
    const bounceLen = Math.hypot(bounceX, bounceY) || 1;
    bounceX /= bounceLen;
    bounceY /= bounceLen;
    active.vx = bounceX * currentShotTargetSpeed(active);
    active.vy = bounceY * currentShotTargetSpeed(active);
    spawnImpactEffect(
      target.x - normal.x * target.radius,
      target.y - normal.y * target.radius,
      normal.x,
      normal.y,
      1.45,
    );
    return true;
  }

  function updateCollisions(dt) {
    for (const [key, ttl] of battle.collisionMemory.entries()) {
      const next = ttl - dt;
      if (next <= 0) battle.collisionMemory.delete(key);
      else battle.collisionMemory.set(key, next);
    }

    for (const [key, ttl] of battle.contactLocks.entries()) {
      const next = ttl - dt;
      if (next <= 0) battle.contactLocks.delete(key);
      else battle.contactLocks.set(key, next);
    }

    for (const [key, ttl] of battle.dodgeCooldowns.entries()) {
      const next = ttl - dt;
      if (next <= 0) battle.dodgeCooldowns.delete(key);
      else battle.dodgeCooldowns.set(key, next);
    }

    for (let i = 0; i < battle.medals.length; i += 1) {
      const a = battle.medals[i];
      if (!isOnBoard(a)) continue;
      for (let j = i + 1; j < battle.medals.length; j += 1) {
        const b = battle.medals[j];
        if (!isOnBoard(b)) continue;
        resolvePair(a, b);
        if (battle.defeatEffect) return;
      }
    }
  }

  function pairKey(a, b) {
    return a.id < b.id ? `${a.id}|${b.id}` : `${b.id}|${a.id}`;
  }

  function resolveRushBlowawayPair(a, b, dx, dy, dist, minDist, key) {
    if (!battle.rushBlowaway) return false;
    const actor = battle.medals.find((medal) => medal.id === battle.rushBlowaway.actorId);
    const blown = battle.medals.find((medal) => medal.id === battle.rushBlowaway.targetId);
    if (!actor || !blown) return false;

    const hasBlown = a === blown || b === blown;
    const hasActor = a === actor || b === actor;
    if (!hasBlown && !hasActor) return false;

    if (hasBlown && (blown === a ? b : a) === actor && tryResolveRushBlowawayActorContact(blown)) {
      return true;
    }

    if (dist >= minDist + 4) {
      battle.contactLocks.delete(key);
      return hasBlown || hasActor;
    }
    if (dist >= minDist) return hasBlown || hasActor;

    const nx = dx / dist;
    const ny = dy / dist;
    const overlap = minDist - dist;

    if (hasBlown) {
      const other = blown === a ? b : a;
      const contactX = blown === a ? nx : -nx;
      const contactY = blown === a ? ny : -ny;
      const separation = overlap + 3;
      blown.x -= contactX * separation * 0.55;
      blown.y -= contactY * separation * 0.55;
      other.x += contactX * separation * 0.45;
      other.y += contactY * separation * 0.45;

      if (!battle.contactLocks.has(key)) {
        spawnImpactEffect(
          blown.x + contactX * blown.radius,
          blown.y + contactY * blown.radius,
          contactX,
          contactY,
          1.25,
        );

        if (other !== actor) {
          const carry = blown.currentSpeed * 0.82;
          setBumpVelocity(other, contactX * carry + blown.vx * 0.08, contactY * carry + blown.vy * 0.08, 0.42);
          bounceRushBlowaway(blown, contactX, contactY, 0.06);
        }
        battle.contactLocks.set(key, 0.07);
      }
      return true;
    }

    if (hasActor) {
      const other = actor === a ? b : a;
      if (other.team !== "enemy" || other.removed) return true;
      const contactX = actor === a ? nx : -nx;
      const contactY = actor === a ? ny : -ny;
      const separation = overlap + 2;
      actor.x -= contactX * separation * 0.16;
      actor.y -= contactY * separation * 0.16;
      other.x += contactX * separation * 0.84;
      other.y += contactY * separation * 0.84;
      if (!battle.contactLocks.has(key)) {
        applyRushDContactDamage(actor, other);
        battle.contactLocks.set(key, 0.14);
      }
      return true;
    }

    return false;
  }

  function bendRushBlowaway(medal, contactX, contactY, strength) {
    const speed = medal.currentSpeed || DEFAULT_MOVE_SPEED;
    const dirLength = Math.hypot(medal.vx, medal.vy) || 1;
    const dirX = medal.vx / dirLength;
    const dirY = medal.vy / dirLength;
    const side = dirX * contactY - dirY * contactX;
    const angled = rotateVector(dirX, dirY, -side * strength);
    medal.vx = angled.x * speed;
    medal.vy = angled.y * speed;
  }

  function bounceRushBlowaway(medal, contactX, contactY, strength) {
    const speed = medal.currentSpeed || DEFAULT_MOVE_SPEED;
    const dirLength = Math.hypot(medal.vx, medal.vy) || 1;
    const dirX = medal.vx / dirLength;
    const dirY = medal.vy / dirLength;
    const dot = dirX * contactX + dirY * contactY;
    let bx = dirX - 2 * dot * contactX;
    let by = dirY - 2 * dot * contactY;
    const angled = rotateVector(bx, by, strength);
    const len = Math.hypot(angled.x, angled.y) || 1;
    medal.vx = (angled.x / len) * speed;
    medal.vy = (angled.y / len) * speed;
  }

  function applyRushDContactDamage(actor, enemy) {
    addCsGauge(1);
    if (enemy.defeatPending || enemy.hp <= 0) {
      addCombo(1);
      return;
    }
    const damage = calculateDamage(actor, enemy);
    addCombo(1);
    applyDamage(actor, enemy, damage, "接触ダメージ");
  }

  function resolvePair(a, b) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const dist = Math.hypot(dx, dy) || 0.0001;
    const minDist = a.radius + b.radius;

    const key = pairKey(a, b);
    if (resolveRushBlowawayPair(a, b, dx, dy, dist, minDist, key)) return;
    const timeStopActor = timeStopActorMedal();
    if (timeStopActor && battle.timeStop?.active && !battle.timeStop.releasing && (a === timeStopActor || b === timeStopActor)) {
      const enemy = a === timeStopActor ? b : a;
      if (enemy.team !== "enemy" || enemy.removed) return;
      if (dist >= minDist + 4) {
        battle.timeStop.contactHitIds.delete(enemy.id);
        battle.timeStop.directContactIds.delete(enemy.id);
        battle.contactLocks.delete(key);
        return;
      }
      if (dist < minDist) {
        const contactX = timeStopActor === a ? dx / dist : -dx / dist;
        const contactY = timeStopActor === a ? dy / dist : -dy / dist;
        registerTimeStopDirectContact(timeStopActor, enemy, contactX, contactY, key);
        applyTimeStopContactDamage(timeStopActor, enemy);
      }
      return;
    }
    if (dist >= minDist + 4) {
      battle.contactLocks.delete(key);
      battle.collisionMemory.delete(`${a.id}->${b.id}`);
      battle.collisionMemory.delete(`${b.id}->${a.id}`);
      return;
    }
    if (dist >= minDist) return;

    const nx = dx / dist;
    const ny = dy / dist;
    const overlap = minDist - dist;

    const active = a.activeShot ? a : b.activeShot ? b : null;
    if (active) {
      const target = active === a ? b : a;
      const contactX = active === a ? nx : -nx;
      const contactY = active === a ? ny : -ny;
      if (shouldDodgeActiveEnemyContact(active, target)) {
        const dodgeKey = `${active.id}->${target.id}`;
        if (!battle.dodgeCooldowns.has(dodgeKey)) {
          spawnDodgeEffect(target, active);
          battle.dodgeCooldowns.set(dodgeKey, 0.28);
        }
        battle.contactLocks.set(key, 0.06);
        return;
      }
      const separation = overlap + 3;
      const targetCorrectionShare = active.team === target.team
        ? 0.78
        : Math.max(0.18, Math.min(0.58, active.mass / (active.mass + target.mass)));
      const activeCorrectionShare = 1 - targetCorrectionShare;
      active.x -= contactX * separation * activeCorrectionShare;
      active.y -= contactY * separation * activeCorrectionShare;
      target.x += contactX * separation * targetCorrectionShare;
      target.y += contactY * separation * targetCorrectionShare;

      if (!battle.contactLocks.has(key)) {
        const contactSpeed = Math.hypot(active.vx, active.vy);
        const impactIntensity = active.team === target.team
          ? Math.max(0.55, Math.min(1.15, contactSpeed / DEFAULT_MOVE_SPEED))
          : Math.max(0.75, Math.min(1.55, contactSpeed / DEFAULT_MOVE_SPEED));
        spawnImpactEffect(
          active.x + contactX * active.radius,
          active.y + contactY * active.radius,
          contactX,
          contactY,
          impactIntensity,
        );
        resolveActiveShotCollision(active, target, contactX, contactY);
        applyContactDamage(a, b);
        battle.contactLocks.set(key, CONTACT_RETRIGGER_COOLDOWN_SECONDS);
      }
      return;
    }

    const totalMass = a.mass + b.mass;
    a.x -= nx * overlap * (b.mass / totalMass);
    a.y -= ny * overlap * (b.mass / totalMass);
    b.x += nx * overlap * (a.mass / totalMass);
    b.y += ny * overlap * (a.mass / totalMass);

    const rvx = b.vx - a.vx;
    const rvy = b.vy - a.vy;
    const velAlongNormal = rvx * nx + rvy * ny;
    if (velAlongNormal < 0) {
      const restitution = 0.92;
      const impulse = (-(1 + restitution) * velAlongNormal) / (1 / a.mass + 1 / b.mass);
      const ix = impulse * nx;
      const iy = impulse * ny;
      a.vx -= ix / a.mass;
      a.vy -= iy / a.mass;
      b.vx += ix / b.mass;
      b.vy += iy / b.mass;
      a.moving = a.moving || Math.hypot(a.vx, a.vy) > 4;
      b.moving = b.moving || Math.hypot(b.vx, b.vy) > 4;
      keepSpeedIfShot(a);
      keepSpeedIfShot(b);
      const impulseIntensity = Math.max(0.45, Math.min(1.25, Math.abs(velAlongNormal) / DEFAULT_MOVE_SPEED));
      spawnImpactEffect(a.x + nx * a.radius, a.y + ny * a.radius, nx, ny, impulseIntensity);
    }

    applyContactDamage(a, b);
  }

  function shouldDodgeActiveEnemyContact(active, target) {
    return Boolean(
      isBombDodgeActive()
      && active.team === "enemy"
      && target.team === "ally"
      && active.activeShot
      && battle.movingMedal?.id === active.id
    );
  }

  function resolveActiveShotCollision(active, target, fromActiveToTargetX, fromActiveToTargetY) {
    const speed = Math.hypot(active.vx, active.vy);
    if (speed < 0.001) return;

    const dirX = active.vx / speed;
    const dirY = active.vy / speed;
    const side = dirX * fromActiveToTargetY - dirY * fromActiveToTargetX;
    const forward = Math.max(0, dirX * fromActiveToTargetX + dirY * fromActiveToTargetY);
    const massRatio = target.mass / Math.max(0.01, active.mass);
    const targetPush = active.team === target.team
      ? active.currentSpeed
        * 0.72
        * Math.min(1.35, Math.max(0.06, active.mass / target.mass))
        * 1.18
      : active.currentSpeed
        * enemyBumpResponse(massRatio)
        * (1.02 + forward * 0.13);
    if (targetPush > 1) {
      const carry = active.team === target.team ? 0.46 : 0.32;
      const bumpX = fromActiveToTargetX * targetPush + dirX * targetPush * carry;
      const bumpY = fromActiveToTargetY * targetPush + dirY * targetPush * carry;
      setBumpVelocity(target, bumpX, bumpY);
    }

    if (forward > 0.1 && applyWallPinchBounce(active, target, fromActiveToTargetX, fromActiveToTargetY, dirX, dirY)) {
      return;
    }

    if (active.team === target.team) {
      keepSpeedIfShot(active);
      return;
    }

    if (massRatio >= 4.5) {
      const reflect = side >= 0 ? 0.92 : -0.92;
      const bounced = rotateVector(-dirX, -dirY, reflect * 0.28);
      active.vx = bounced.x * active.currentSpeed;
      active.vy = bounced.y * active.currentSpeed;
      return;
    }

    if (massRatio >= 2.2) {
      const bounce = 0.42 + Math.min(0.42, (massRatio - 2.2) * 0.18);
      const glancing = rotateVector(dirX, dirY, -side * (0.34 + (massRatio - 1) * 0.08));
      active.vx = (glancing.x * (1 - bounce) - fromActiveToTargetX * bounce) * active.currentSpeed;
      active.vy = (glancing.y * (1 - bounce) - fromActiveToTargetY * bounce) * active.currentSpeed;
      keepSpeedIfShot(active);
      return;
    }

    const bendStrength = Math.min(0.42, Math.max(0.04, (massRatio - 1) * 0.22 + 0.05));
    const bend = Math.max(-0.32, Math.min(0.32, -side * bendStrength));
    if (Math.abs(bend) > 0.001) {
      const angled = rotateVector(dirX, dirY, bend);
      active.vx = angled.x * currentShotTargetSpeed(active);
      active.vy = angled.y * currentShotTargetSpeed(active);
    } else {
      keepSpeedIfShot(active);
    }
  }

  function enemyBumpResponse(massRatio) {
    if (massRatio >= 4.5) return 0;
    const normalized = Math.max(0, Math.min(1, (4.5 - massRatio) / 3.5));
    return Math.max(0.08, normalized ** 1.05 * 1.18);
  }

  function calculateDamage(attacker, defender, attackMultiplier = 1, options = {}) {
    const defense = options.ignoreDefense ? 0 : defender.defense;
    return Math.max(1, Math.round(attacker.attack * (attacker.attackModifier ?? 1) * attackMultiplier - defense));
  }

  function applyDamage(attacker, defender, damage, label = "ダメージ", options = {}) {
    if (defender.removed || defender.hp <= 0) return false;

    const announceDefeat = options.announceDefeat ?? true;
    const yOffset = options.yOffset ?? 0;
    const stackIndex = options.stackIndex ?? null;
    const wasAlive = defender.hp > 0 && !defender.defeatPending;
    defender.hp = Math.max(0, defender.hp - damage);
    addLog(`${defender.id} に ${damage} ${label}`);
    spawnDamageNumber(defender, damage, yOffset, stackIndex);
    const defeated = wasAlive && defender.hp <= 0;
    if (defeated) {
      addLog(`${defender.id} 撃破`);
      keepMedalInsideField(defender, false);
      defender.defeatPending = true;
      defender.activeShot = false;
      recordOneMoreDefeat(attacker, defender);
      if (announceDefeat) startDefeatEffect(defender, "announce");
    }
    cleanupBombIfInvalid();
    updateHud();
    return defeated;
  }

  function recordOneMoreDefeat(attacker, defender) {
    if (
      attacker.team === "ally"
      && defender.team === "enemy"
      && battle.phase === "ally"
      && battle.movingMedal?.team === "ally"
      && !battle.oneMoreActive
    ) {
      battle.oneMoreDefeatsThisAction.add(defender.id);
    }
  }

  function postSmashContactAttacker(a, b) {
    const actorId = battle.postSmashContactActorId;
    if (!actorId || battle.phase !== "ally") return null;
    const actor = a.id === actorId ? a : b.id === actorId ? b : null;
    if (!actor || actor.team !== "ally" || actor.removed || actor.hp <= 0) return null;
    if (battle.movingMedal?.id !== actor.id) return null;
    const other = actor === a ? b : a;
    if (!other || other.team === actor.team || other.removed) return null;
    const otherIsMoving = other.moving || other.bumpMoving || Math.hypot(other.vx, other.vy) > 4;
    return otherIsMoving ? actor : null;
  }

  function contactDamageAttacker(a, b) {
    return a.activeShot ? a : b.activeShot ? b : postSmashContactAttacker(a, b);
  }

  function applyContactDamage(a, b) {
    const attacker = contactDamageAttacker(a, b);
    if (!attacker) return;
    const defender = attacker === a ? b : a;
    if (attacker.team === defender.team || defender.removed) return;

    if (
      battle.rushBlowaway
      && attacker.id === battle.rushBlowaway.actorId
      && defender.id === battle.rushBlowaway.targetId
    ) {
      addCsGauge(1);
      if (defender.defeatPending || defender.hp <= 0) {
        addCombo(1);
        return;
      }
      startRushStrike(attacker, defender, "loop");
      return;
    }

    const key = `${attacker.id}->${defender.id}`;
    if (battle.collisionMemory.has(key)) return;
    battle.collisionMemory.set(key, CONTACT_RETRIGGER_COOLDOWN_SECONDS);

    if (defender.defeatPending || defender.hp <= 0) {
      if (attacker.team === "ally" && defender.team === "enemy" && defender.defeatPending) {
        addCsGauge(1);
        addCombo(1);
      }
      return;
    }

    const damage = calculateDamage(attacker, defender);
    applyDamage(attacker, defender, damage);
    addCombo(1);
    if (attacker.team === "ally" && defender.team === "enemy") addCsGauge(1);
  }

  function update(dt) {
    updateComboAnimation(dt);
    updateImpactEffects(dt);
    updateDogoEffects(dt);
    updateDamageNumbers(dt);
    updateWallTrapEffects(dt);
    if (updateWallTrapHitStop(dt)) return;
    updateWallTrapNudges(dt);
    updateDodgeEffects(dt);
    updateOneMoreEffect(dt);
    updateNextTurnEffect(dt);
    if (updateRoundTransitionEffect(dt)) return;
    if (updateRoundBannerEffect(dt)) return;
    updateBombClickEffect(dt);
    updateSmashEffect(dt);
    updateTimeStopEffect(dt);
    updateRushEffect(dt);
    if (battle.rushEffect) return;
    updateCommandSkillEffect(dt);
    if (battle.commandSkillEffect) return;
    updateBombExplosionEffect(dt);
    if (isBlockingBombExplosionEffect()) return;
    cleanupBombIfInvalid();
    if (battle.commandSkillTargeting) return;
    if (battle.defeatEffect) {
      updateDefeatEffect(dt);
      return;
    }
    if (battle.postDefeatPause) {
      updatePostDefeatPause(dt);
      return;
    }
    if (battle.reinforcementEffect) {
      updateReinforcementEffect(dt);
      return;
    }
    if (battle.smashEffect) return;
    if (battle.enemyAction && !battle.movingMedal) {
      updateEnemyTelegraph(dt);
      return;
    }
    for (const medal of battle.medals) updateMedal(medal, dt);
    updateTimeStopAuraDamage();
    updateCollisions(dt);
    recoverMedalsInsideField();
    if (battle.defeatEffect) return;
    finishActionWhenSettled();
  }

  function snapshotDefeatTarget(medal) {
    return {
      id: medal.id,
      team: medal.team,
      x: medal.x,
      y: medal.y,
      radius: medal.radius,
    };
  }

  function startDefeatEffect(medals, mode = "shatter") {
    const targets = (Array.isArray(medals) ? medals : [medals]).filter((medal) => medal.defeatPending && !medal.removed);
    if (targets.length === 0) return;

    if (battle.defeatEffect?.mode === mode) {
      const knownIds = new Set(battle.defeatEffect.medals.map((medal) => medal.id));
      for (const target of targets) {
        if (!knownIds.has(target.id)) battle.defeatEffect.medals.push(snapshotDefeatTarget(target));
      }
      traceEvent("defeat-merge", {
        mode,
        ids: battle.defeatEffect.medals.map((medal) => medal.id),
      }, { visible: true });
      return;
    }

    traceEvent("defeat-start", {
      mode,
      ids: targets.map((target) => target.id),
    }, { visible: true });
    battle.defeatEffect = {
      mode,
      medals: targets.map(snapshotDefeatTarget),
      elapsed: 0,
      duration: DEFEAT_EFFECT_SECONDS,
    };
    if (mode === "announce") {
      phaseText.textContent = targets.length === 1 ? `${targets[0].id} 撃破` : `${targets.length}体 撃破`;
    } else {
      phaseText.textContent = targets.length === 1 ? `${targets[0].id} 破壊` : `${targets.length}体 破壊`;
    }
  }

  function updateDefeatEffect(dt) {
    battle.defeatEffect.elapsed += dt;
    const completedMode = battle.defeatEffect.mode;
    const completedIds = battle.defeatEffect.medals.map((medal) => medal.id);
    if (battle.defeatEffect.elapsed >= battle.defeatEffect.duration) {
      if (battle.defeatEffect.mode === "shatter") {
        let shatteredAllyCount = 0;
        for (const defeated of battle.defeatEffect.medals) {
          const medal = battle.medals.find((m) => m.id === defeated.id);
          if (!medal) continue;
          if (medal.team === "ally") shatteredAllyCount += 1;
          medal.removed = true;
          medal.defeatPending = false;
          medal.hp = 0;
          medal.vx = 0;
          medal.vy = 0;
          medal.moving = false;
          medal.activeShot = false;
          medal.bumpMoving = false;
          medal.bumpElapsed = 0;
          medal.bumpStartVx = 0;
          medal.bumpStartVy = 0;
        }
        if (shatteredAllyCount > 0) {
          const gain = ALLY_DEFEAT_CS_GAIN * shatteredAllyCount;
          addCsGauge(gain);
          addLog(`味方破壊 CS +${gain}`);
        }
      }
      battle.defeatEffect = null;
      traceEvent("defeat-complete", {
        mode: completedMode,
        ids: completedIds,
      }, { visible: true });
      if (completedMode === "shatter") {
        battle.postDefeatPause = {
          elapsed: 0,
          duration: POST_DEFEAT_PAUSE_SECONDS,
        };
        phaseText.textContent = "撃破確認";
      }
    }
  }

  function updatePostDefeatPause(dt) {
    if (!battle.postDefeatPause) return;
    battle.postDefeatPause.elapsed += dt;
    if (battle.postDefeatPause.elapsed >= battle.postDefeatPause.duration) {
      battle.postDefeatPause = null;
      traceEvent("post-defeat-pause-complete", {}, { visible: true });
    }
  }

  function drawField() {
    ctx.clearRect(0, 0, field.width, field.height);
    ctx.fillStyle = "#141922";
    ctx.fillRect(0, 0, field.width, field.height);

    ctx.strokeStyle = "#4c596f";
    ctx.lineWidth = 4;
    roundRect(field.padding, field.padding, field.width - field.padding * 2, field.height - field.padding * 2, 26);
    ctx.stroke();

    ctx.strokeStyle = "rgba(224, 184, 92, 0.14)";
    ctx.lineWidth = 1;
    for (let y = field.padding + 80; y < field.height - field.padding; y += 80) {
      ctx.beginPath();
      ctx.moveTo(field.padding + 12, y);
      ctx.lineTo(field.width - field.padding - 12, y);
      ctx.stroke();
    }
  }

  function roundRect(x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + width, y, x + width, y + height, radius);
    ctx.arcTo(x + width, y + height, x, y + height, radius);
    ctx.arcTo(x, y + height, x, y, radius);
    ctx.arcTo(x, y, x + width, y, radius);
    ctx.closePath();
  }

  function enemyActionFor(medal) {
    return battle.enemyAction?.enemyId === medal.id ? battle.enemyAction : null;
  }

  function drawEnemyTelegraphRing(medal) {
    const action = enemyActionFor(medal);
    if (!action) return;

    const blinkOn = action.stage !== "warning" || Math.sin(action.elapsed * Math.PI * 5) > -0.2;
    if (!blinkOn) return;

    ctx.beginPath();
    ctx.arc(0, 0, medal.radius + 9, 0, Math.PI * 2);
    ctx.strokeStyle = action.stage === "warning" ? "#ff4040" : "#ff9b47";
    ctx.lineWidth = action.stage === "warning" ? 7 : 5;
    ctx.stroke();
  }

  function drawEnemyCountBadge(medal) {
    if (medal.team !== "enemy" || medal.defeatPending) return;

    const x = -medal.radius * 0.48;
    const y = medal.radius * 0.48;
    const r = 21;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = medal.count <= 0 ? "#ff4040" : "#2b3342";
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#ffd36a";
    ctx.stroke();
    ctx.fillStyle = "#ffffff";
    ctx.font = "900 26px Segoe UI, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(Math.max(0, medal.count)), x, y + 1);
  }

  function drawEnemyStatusBadges(medal) {
    if (medal.team !== "enemy" || medal.defeatPending || medal.confusionTurns <= 0) return;

    const x = medal.radius * 0.45;
    const y = medal.radius * 0.48;
    const r = 17;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = "#7b4cff";
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = "#f0dcff";
    ctx.stroke();
    ctx.fillStyle = "#ffffff";
    ctx.font = "900 16px Segoe UI, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("混", x, y + 1);
  }

  function drawPendingCracks(medal) {
    if (!medal.defeatPending) return;

    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#f8f0d8";
    ctx.lineWidth = 3;
    const cracks = [
      [[0, -medal.radius * 0.72], [-6, -20], [8, -5], [-4, medal.radius * 0.35]],
      [[-medal.radius * 0.62, -6], [-23, -1], [-8, 9], [-17, 27]],
      [[medal.radius * 0.55, -12], [27, -5], [11, 12], [24, 30]],
    ];
    for (const crack of cracks) {
      ctx.beginPath();
      crack.forEach(([x, y], index) => {
        if (index === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    }

    ctx.restore();
  }

  function drawMedal(medal) {
    if (!isOnBoard(medal)) return;

    ctx.save();
    const intro = medal.spawnIntro;
    if (intro) {
      const progress = Math.min(1, intro.elapsed / intro.duration);
      const fallProgress = Math.min(1, progress / 0.86);
      const settleProgress = Math.max(0, (progress - 0.86) / 0.14);
      const ease = 1 - (1 - fallProgress) ** 3;
      const fadeIn = Math.min(1, progress / 0.34);
      const spinScale = 0.14 + 0.86 * Math.abs(Math.cos(fallProgress * Math.PI * 5));
      const coinScale = progress < 0.86 ? spinScale : 1;
      const landingSquash = Math.sin(Math.min(1, settleProgress) * Math.PI) * 0.08;
      ctx.globalAlpha *= 0.18 + fadeIn * 0.82;
      ctx.translate(medal.x, medal.y - (1 - ease) * 42);
      ctx.scale(coinScale + landingSquash * 0.65, 1 + Math.sin(progress * Math.PI) * 0.04 - landingSquash);
    } else {
      ctx.translate(medal.x, medal.y);
    }
    const mutedByTimeStop = Boolean(
      battle.timeStop?.active
      && !battle.timeStop.releasing
      && medal.id !== battle.timeStop.actorId
    );
    ctx.beginPath();
    ctx.arc(0, 0, medal.radius, 0, Math.PI * 2);
    ctx.fillStyle = mutedByTimeStop ? "#8b8f98" : medal.team === "ally" ? "#f4f7fb" : "#050608";
    ctx.fill();

    ctx.lineWidth = 3;
    ctx.strokeStyle = mutedByTimeStop ? "#c5c9d2" : medal.team === "ally" ? "#7ac7d8" : "#ff6f6f";
    ctx.stroke();

    if (isReady(medal)) {
      const selected = medal === activeMedal() && !battle.movingMedal;
      const armed = isCommandSkillArmed(medal);
      const commandSkillReady = canPrimeCommandSkill(medal) || isCommandSkillStandby(medal) || armed;
      const standby = isCommandSkillStandby(medal) || armed;
      if (commandSkillReady) {
        ctx.beginPath();
        ctx.arc(0, 0, medal.radius + 4, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(122, 226, 255, 0.78)";
        ctx.lineWidth = 5;
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.arc(0, 0, medal.radius + 8, 0, Math.PI * 2);
      ctx.strokeStyle = selected ? "#ffd36a" : "rgba(255, 218, 102, 0.9)";
      ctx.lineWidth = selected ? 6 : 4;
      ctx.stroke();

      if (standby) {
        const pulse = 0.5 + 0.5 * Math.sin(performance.now() / 140);
        ctx.beginPath();
        ctx.arc(0, 0, medal.radius + 14, 0, Math.PI * 2);
        ctx.strokeStyle = "#8ff7ff";
        ctx.lineWidth = 8;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(0, 0, medal.radius + 23 + pulse * 4, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(143, 247, 255, ${0.28 + pulse * 0.2})`;
        ctx.lineWidth = 3 + pulse * 2;
        ctx.stroke();
      }
    }

    drawEnemyTelegraphRing(medal);

    const hpRatio = Math.max(0, medal.hp / medal.maxHp);
    ctx.beginPath();
    ctx.arc(0, 0, medal.radius - 7, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * hpRatio);
    ctx.strokeStyle = mutedByTimeStop ? "#d8dbe2" : hpRatio > 0.4 ? "#81d08b" : "#ffb15f";
    ctx.lineWidth = 4;
    ctx.stroke();

    if (medal.team === "ally") {
      ctx.fillStyle = "#111318";
      ctx.font = "900 30px Segoe UI, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(medal.label, 0, 1);
    } else if (!medal.defeatPending) {
      ctx.fillStyle = mutedByTimeStop ? "#111318" : "#fff2a6";
      ctx.font = "900 30px Segoe UI, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.lineWidth = 5;
      ctx.strokeStyle = mutedByTimeStop ? "rgba(255, 255, 255, 0.55)" : "rgba(0, 0, 0, 0.9)";
      ctx.strokeText(medal.label, 0, 1);
      ctx.fillText(medal.label, 0, 1);
    }
    drawEnemyCountBadge(medal);
    drawEnemyStatusBadges(medal);
    drawPendingCracks(medal);
    ctx.restore();
  }

  function drawImpactEffects() {
    if (battle.impactEffects.length === 0) return;

    ctx.save();
    ctx.lineCap = "round";
    ctx.globalCompositeOperation = "lighter";

    for (const effect of battle.impactEffects) {
      const progress = Math.min(1, effect.age / effect.duration);
      const alpha = Math.max(0, 1 - progress);
      const tail = 0.032 + progress * 0.018;

      ctx.globalAlpha = alpha * 0.88;
      ctx.strokeStyle = effect.color;
      ctx.fillStyle = effect.color;
      ctx.lineWidth = Math.max(1.4, effect.size * (1 - progress * 0.45));

      ctx.beginPath();
      ctx.moveTo(effect.x, effect.y);
      ctx.lineTo(effect.x - effect.vx * tail, effect.y - effect.vy * tail);
      ctx.stroke();

      ctx.globalAlpha = alpha * 0.55;
      ctx.beginPath();
      ctx.arc(effect.x, effect.y, Math.max(1, effect.size * 0.45), 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  function drawDamageNumbers() {
    if (battle.damageNumbers.length === 0) return;

    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    for (const number of battle.damageNumbers) {
      const progress = Math.min(1, number.age / number.duration);
      const fade = progress < 0.75 ? 1 : Math.max(0, 1 - (progress - 0.75) / 0.25);
      const pulse = 1 + Math.max(0, 1 - progress * 5) * 0.22;
      const fontSize = Math.round(26 * pulse);

      ctx.save();
      ctx.translate(number.x, number.y);
      ctx.scale(1.5, 2);
      ctx.globalAlpha = fade;
      ctx.font = `900 ${fontSize}px Segoe UI, sans-serif`;
      ctx.lineWidth = 5;
      ctx.strokeStyle = number.team === "ally" ? "rgba(255, 255, 255, 0.96)" : "rgba(20, 10, 8, 0.9)";
      ctx.fillStyle = number.team === "ally" ? "#08090c" : "#ffffff";
      ctx.strokeText(String(number.value), 0, 0);
      ctx.fillText(String(number.value), 0, 0);
      ctx.restore();
    }

    ctx.restore();
  }

  function drawSmashEffect() {
    const effect = battle.smashEffect;
    if (!effect) return;

    const progress = Math.min(1, effect.elapsed / effect.duration);
    const ease = 1 - (1 - progress) ** 3;
    const fade = Math.max(0, 1 - progress);
    const waveRadius = effect.medalRadius + (effect.range - effect.medalRadius) * ease;
    const trailProgress = Math.max(0, progress - 0.18) / 0.82;
    const trailRadius = effect.medalRadius + (effect.range - effect.medalRadius) * trailProgress;

    ctx.save();
    ctx.translate(effect.x, effect.y);
    ctx.globalCompositeOperation = "lighter";

    ctx.globalAlpha = 0.13 * fade;
    ctx.beginPath();
    ctx.arc(0, 0, effect.range, 0, Math.PI * 2);
    ctx.fillStyle = "#e0b85c";
    ctx.fill();

    ctx.globalAlpha = 0.54 * fade;
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#ffd36a";
    ctx.beginPath();
    ctx.arc(0, 0, effect.range, 0, Math.PI * 2);
    ctx.stroke();

    ctx.globalAlpha = 0.9 * fade;
    ctx.lineWidth = 10 * fade + 2;
    ctx.strokeStyle = "#fff2a6";
    ctx.beginPath();
    ctx.arc(0, 0, waveRadius, 0, Math.PI * 2);
    ctx.stroke();

    if (progress > 0.18) {
      const trailFade = Math.max(0, 1 - trailProgress) * 0.45;
      ctx.globalAlpha = trailFade;
      ctx.lineWidth = 6 * trailFade + 1;
      ctx.strokeStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(0, 0, trailRadius, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }

  function drawConfusionWallCommandSkillEffect(effect) {
    const progress = Math.min(1, effect.elapsed / effect.duration);
    const pulse = Math.sin(progress * Math.PI);
    const waveCount = Math.max(1, effect.waveCount ?? CONFUSION_WALL_WAVE_COUNT);

    ctx.save();
    ctx.globalCompositeOperation = "lighter";

    ctx.globalAlpha = 0.16 * Math.max(0, 1 - progress * 0.6);
    ctx.fillStyle = "#7fd7ff";
    ctx.beginPath();
    ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
    ctx.fill();

    for (let i = 0; i < waveCount; i += 1) {
      const local = Math.min(1, Math.max(0, (effect.elapsed - i * 0.11) / 0.72));
      if (local <= 0 || local >= 1) continue;
      const fade = 1 - local;
      ctx.globalAlpha = 0.55 * fade;
      ctx.strokeStyle = i % 2 === 0 ? "#9ae6ff" : "#fff2a6";
      ctx.lineWidth = 6 + 6 * fade;
      ctx.beginPath();
      ctx.arc(effect.x, effect.y, effect.radius * local, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.globalAlpha = 0.28 + 0.24 * pulse;
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }

  function drawCommandSkillEffect() {
    const effect = battle.commandSkillEffect;
    if (!effect) return;
    if (effect.type === "confusion-wall") {
      drawConfusionWallCommandSkillEffect(effect);
      return;
    }

    const progress = Math.min(1, effect.elapsed / effect.duration);
    const flash = Math.max(0, 1 - progress);
    const pulse = Math.sin(progress * Math.PI);
    const caster = battle.medals.find((medal) => medal.id === effect.casterId) ?? effect;
    const targets = effect.targetIds
      .map((id) => battle.medals.find((medal) => medal.id === id && !medal.removed))
      .filter(Boolean);

    ctx.save();
    ctx.globalCompositeOperation = "lighter";

    ctx.globalAlpha = 0.18 * flash;
    ctx.fillStyle = "#fff2a6";
    ctx.fillRect(field.padding, field.padding, field.width - field.padding * 2, field.height - field.padding * 2);

    ctx.globalAlpha = 0.28 + 0.35 * pulse;
    ctx.strokeStyle = "#ffd36a";
    ctx.lineWidth = 8 + 10 * pulse;
    ctx.beginPath();
    ctx.arc(caster.x, caster.y, caster.radius + 26 + 105 * progress, 0, Math.PI * 2);
    ctx.stroke();

    ctx.globalAlpha = 0.42 + 0.32 * pulse;
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#ffffff";
    for (let i = 0; i < 12; i += 1) {
      const angle = (Math.PI * 2 * i) / 12 + progress * 1.7;
      const inner = caster.radius + 20;
      const outer = caster.radius + 82 + 50 * pulse;
      ctx.beginPath();
      ctx.moveTo(caster.x + Math.cos(angle) * inner, caster.y + Math.sin(angle) * inner);
      ctx.lineTo(caster.x + Math.cos(angle) * outer, caster.y + Math.sin(angle) * outer);
      ctx.stroke();
    }

    for (const target of targets) {
      const dx = target.x - caster.x;
      const dy = target.y - caster.y;
      const len = Math.hypot(dx, dy) || 1;
      const nx = dx / len;
      const ny = dy / len;
      const hitProgress = Math.min(1, Math.max(0, (progress - 0.14) / 0.58));
      const beamEndX = caster.x + dx * hitProgress;
      const beamEndY = caster.y + dy * hitProgress;

      ctx.globalAlpha = 0.36 + 0.3 * pulse;
      ctx.lineWidth = 12;
      ctx.strokeStyle = "#f6d676";
      ctx.beginPath();
      ctx.moveTo(caster.x + nx * caster.radius, caster.y + ny * caster.radius);
      ctx.lineTo(beamEndX, beamEndY);
      ctx.stroke();

      if (hitProgress >= 0.98) {
        ctx.globalAlpha = 0.55 * flash + 0.18;
        ctx.lineWidth = 6;
        ctx.strokeStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(target.x, target.y, target.radius + 18 + 26 * pulse, 0, Math.PI * 2);
        ctx.stroke();

        ctx.globalAlpha = 0.24 * flash + 0.12;
        ctx.fillStyle = "#ffd36a";
        ctx.beginPath();
        ctx.arc(target.x, target.y, target.radius + 38 * pulse, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }

  function drawDogoEffects() {
    if (battle.dogoEffects.length === 0) return;
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (const effect of battle.dogoEffects) {
      if (effect.age < 0) continue;
      const progress = Math.min(1, effect.age / effect.duration);
      const fade = Math.max(0, 1 - progress);
      const pop = 1 + Math.sin(progress * Math.PI) * 0.22;
      ctx.save();
      ctx.translate(effect.x, effect.y - progress * 10);
      ctx.rotate(effect.rotation);
      ctx.globalAlpha = fade;
      ctx.font = `900 ${Math.round(22 * effect.scale * pop)}px Segoe UI, sans-serif`;
      ctx.fillStyle = "#fff8c8";
      ctx.fillText("ドゴ", 0, 0);
      ctx.restore();

      ctx.save();
      ctx.globalAlpha = 0.68 * Math.sin(progress * Math.PI);
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 3.5;
      ctx.lineCap = "round";
      ctx.globalCompositeOperation = "lighter";
      for (let ray = 0; ray < 7; ray += 1) {
        const angle = (Math.PI * 2 * ray) / 7 + (effect.index ?? 0) * 0.4;
        const inner = 7 + progress * 5;
        const outer = 24 + progress * 15;
        ctx.beginPath();
        ctx.moveTo(effect.x + Math.cos(angle) * inner, effect.y + Math.sin(angle) * inner);
        ctx.lineTo(effect.x + Math.cos(angle) * outer, effect.y + Math.sin(angle) * outer);
        ctx.stroke();
      }
      ctx.restore();
    }
    ctx.restore();
  }

  function drawRushEffect() {
    const effect = battle.rushEffect;
    if (!effect) return;

    const progress = Math.min(1, effect.elapsed / effect.duration);
    const actor = battle.medals.find((medal) => medal.id === effect.actorId);
    const targets = effect.kind === "time-stop-final"
      ? effect.targetIds
        .map((id) => battle.medals.find((medal) => medal.id === id && !medal.removed))
        .filter(Boolean)
      : [battle.medals.find((medal) => medal.id === effect.targetId && !medal.removed)].filter(Boolean);
    if (!actor || targets.length === 0) return;

    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    const titleAlpha = Math.min(1, progress * 4) * Math.max(0, 1 - Math.max(0, progress - 0.78) / 0.22);
    ctx.globalAlpha = 0.08 + titleAlpha * 0.1;
    ctx.fillStyle = "#fff2a6";
    ctx.fillRect(field.padding, field.padding, field.width - field.padding * 2, field.height - field.padding * 2);

    for (const target of targets) {
      const localPulse = 0.5 + 0.5 * Math.sin(effect.elapsed * Math.PI * 9);
      ctx.globalAlpha = 0.16 + localPulse * 0.1;
      ctx.strokeStyle = effect.kind === "time-stop-final" ? "#d9f7ff" : "#ffd36a";
      ctx.lineWidth = 3 + localPulse * 3;
      ctx.beginPath();
      ctx.arc(target.x, target.y, target.radius + 12 + localPulse * 8, 0, Math.PI * 2);
      ctx.stroke();

      const dogoList = dogoPositions();
      const finalDogo = effect.kind === "time-stop-final";
      const dogoCount = finalDogo ? Math.min(effect.hits, dogoList.length) : dogoList.length;
      const sequenceStart = finalDogo ? Math.max(0.08, RUSH_HIT_WINDUP_SECONDS - 0.45) : 0;
      for (let i = 0; i < dogoCount; i += 1) {
        const { x: px, y: py, r: rot } = dogoList[i];
        const cycle = finalDogo ? effect.elapsed - sequenceStart : effect.elapsed % 1.05;
        const dogoAge = cycle - i * RUSH_DOGO_STEP_SECONDS;
        if (dogoAge < 0 || dogoAge > RUSH_DOGO_DURATION_SECONDS) continue;
        const dogoProgress = dogoAge / RUSH_DOGO_DURATION_SECONDS;
        const fade = Math.sin(dogoProgress * Math.PI);
        const pop = 1 + Math.sin(dogoProgress * Math.PI) * 0.22;
        const hx = target.x + px * target.radius;
        const hy = target.y + py * target.radius;
        ctx.save();
        ctx.translate(hx, hy - dogoProgress * 8);
        ctx.rotate(rot);
        ctx.globalAlpha = 0.86 * fade;
        ctx.font = `900 ${Math.round(25 * pop)}px Segoe UI, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.lineWidth = 7;
        ctx.strokeStyle = "rgba(13, 16, 22, 0.96)";
        ctx.fillStyle = "#fff2a6";
        ctx.strokeText("ドゴ", 0, 0);
        ctx.fillText("ドゴ", 0, 0);
        ctx.restore();

        ctx.save();
        ctx.globalAlpha = 0.7 * fade;
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 4;
        ctx.lineCap = "round";
        ctx.globalCompositeOperation = "lighter";
        for (let ray = 0; ray < 7; ray += 1) {
          const angle = (Math.PI * 2 * ray) / 7 + i * 0.4;
          const inner = 8 + dogoProgress * 5;
          const outer = 28 + dogoProgress * 18;
          ctx.beginPath();
          ctx.moveTo(hx + Math.cos(angle) * inner, hy + Math.sin(angle) * inner);
          ctx.lineTo(hx + Math.cos(angle) * outer, hy + Math.sin(angle) * outer);
          ctx.stroke();
        }
        ctx.restore();
      }
    }

    ctx.restore();
  }

  function drawTimeStopEffect() {
    const effect = battle.timeStopEffect;
    if (!effect) return;
    const progress = Math.min(1, effect.elapsed / effect.duration);
    const maxRadius = Math.hypot(field.width, field.height);
    const endRadius = effect.endRadius ?? 0;
    const releaseRemain = Math.pow(1 - progress, 2.45);
    const radius = effect.mode === "release"
      ? endRadius + (maxRadius - endRadius) * releaseRemain
      : endRadius + (maxRadius - endRadius) * progress;
    const fade = effect.mode === "release" ? Math.max(0, 1 - progress * 0.55) : Math.max(0, 1 - progress);

    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = 0.18 + fade * 0.22;
    ctx.strokeStyle = effect.mode === "release" ? "#fff2a6" : "#d9f7ff";
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.arc(effect.x, effect.y, Math.max(0, radius), 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }

  function drawBombTargetingRings() {
    if (!battle.commandSkillTargeting) return;
    const pulse = 0.5 + 0.5 * Math.sin(performance.now() / 110);
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    if (battle.commandSkillTargeting.mode === "point-bomb") {
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "rgba(0, 0, 0, 0.28)";
      ctx.fillRect(field.padding, field.padding, field.width - field.padding * 2, field.height - field.padding * 2);

      ctx.globalCompositeOperation = "lighter";
      ctx.strokeStyle = `rgba(255, 211, 106, ${0.55 + pulse * 0.25})`;
      ctx.lineWidth = 4 + pulse * 3;
      roundRect(field.padding + 14, field.padding + 14, field.width - field.padding * 2 - 28, field.height - field.padding * 2 - 28, 24);
      ctx.stroke();

      ctx.globalCompositeOperation = "source-over";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = "900 28px Segoe UI, sans-serif";
      ctx.lineWidth = 7;
      ctx.strokeStyle = "rgba(13, 16, 22, 0.96)";
      ctx.fillStyle = "#fff2a6";
      ctx.strokeText("爆破地点を選択", field.width / 2, field.padding + 70);
      ctx.fillText("爆破地点を選択", field.width / 2, field.padding + 70);
      ctx.restore();
      return;
    }

    for (const enemy of living("enemy")) {
      ctx.beginPath();
      ctx.arc(enemy.x, enemy.y, enemy.radius + 9 + pulse * 4, 0, Math.PI * 2);
      ctx.strokeStyle = "#ff4444";
      ctx.lineWidth = 8;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(enemy.x, enemy.y, enemy.radius + 24 + pulse * 8, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255, 95, 95, ${0.35 + pulse * 0.28})`;
      ctx.lineWidth = 3 + pulse * 3;
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawBombMarker() {
    if (!battle.bomb) return;
    const target = battle.medals.find((medal) => medal.id === battle.bomb.targetId && isOnBoard(medal));
    if (!target) return;
    drawBombIcon(target.x + target.radius * 0.42, target.y - target.radius * 0.48, "B");
  }

  function drawBombIcon(x, y, label = "", scale = 1) {
    const pulse = 0.5 + 0.5 * Math.sin(performance.now() / 160);

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.globalCompositeOperation = "lighter";
    ctx.beginPath();
    ctx.arc(0, 0, 14 + pulse * 2, 0, Math.PI * 2);
    ctx.fillStyle = "#171717";
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#ff6b3f";
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(7, -10);
    ctx.quadraticCurveTo(20, -21, 13, -30);
    ctx.strokeStyle = "#ffd36a";
    ctx.lineWidth = 3;
    ctx.stroke();

    if (label) {
      ctx.font = "900 12px Segoe UI, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#ffcf5f";
      ctx.fillText(label, 0, 1);
    }
    ctx.restore();
  }

  function drawDodgeEffects() {
    if (battle.dodgeEffects.length === 0) return;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.lineCap = "round";
    for (const effect of battle.dodgeEffects) {
      const progress = Math.min(1, effect.elapsed / effect.duration);
      const fade = Math.max(0, 1 - progress);
      const sideX = -effect.dirY;
      const sideY = effect.dirX;
      const offset = 8 + progress * 30;
      const length = effect.radius * 0.8;

      ctx.globalAlpha = fade;
      ctx.strokeStyle = "#d9f7ff";
      ctx.lineWidth = 5;
      for (let i = -1; i <= 1; i += 1) {
        const cx = effect.x + sideX * (i * 12 + offset);
        const cy = effect.y + sideY * (i * 12 + offset);
        ctx.beginPath();
        ctx.moveTo(cx - effect.dirX * length - sideX * 10, cy - effect.dirY * length - sideY * 10);
        ctx.lineTo(cx + effect.dirX * length + sideX * 10, cy + effect.dirY * length + sideY * 10);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  function drawBombClickEffect() {
    const effect = battle.bombClickEffect;
    if (!effect) return;
    const progress = Math.min(1, effect.elapsed / effect.duration);
    const fade = Math.max(0, 1 - progress);
    ctx.save();
    ctx.translate(
      effect.x + (effect.radius ?? 48) * 0.62,
      effect.y - (effect.radius ?? 48) * 0.78 - progress * 6,
    );
    ctx.rotate((-20 * Math.PI) / 180);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `900 ${10 + progress * 4}px Segoe UI, sans-serif`;
    ctx.lineWidth = 3;
    ctx.globalAlpha = fade;
    ctx.strokeStyle = "rgba(13, 16, 22, 0.95)";
    ctx.fillStyle = "#fff2a6";
    ctx.strokeText("カチッ", 0, 0);
    ctx.fillText("カチッ", 0, 0);
    ctx.restore();
  }

  function drawBombExplosionEffect() {
    const effect = battle.bombExplosionEffect;
    if (!effect) return;
    drawBombExplosionVisual(effect);
  }

  function drawWallTrapEffects() {
    for (const effect of battle.wallTrapEffects) drawBombExplosionVisual(effect);
  }

  function drawBombExplosionVisual(effect) {
    if (effect.elapsed < 0) {
      if (effect.kind === "point-bomb") drawPointBombArmingEffect(effect);
      return;
    }
    const progress = Math.min(1, effect.elapsed / effect.duration);
    const grow = Math.min(1, progress / 0.42);
    const fade = progress < 0.78 ? 1 : Math.max(0, 1 - (progress - 0.78) / 0.22);
    const pulse = Math.sin(progress * Math.PI * 5);

    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.translate(effect.x, effect.y);

    if (effect.kind !== "wall-trap") {
      ctx.globalAlpha = 0.22 * fade;
      ctx.fillStyle = "#ff9c4b";
      ctx.beginPath();
      ctx.arc(0, 0, effect.radius * grow, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalAlpha = 0.78 * fade;
      ctx.lineWidth = 12 + pulse * 2;
      ctx.strokeStyle = "#fff2a6";
      ctx.beginPath();
      ctx.arc(0, 0, effect.radius * grow, 0, Math.PI * 2);
      ctx.stroke();
    }

    const rayCount = effect.kind === "wall-trap" ? 22 : 18;
    ctx.globalAlpha = (effect.kind === "wall-trap" ? 0.72 : 0.62) * fade;
    ctx.strokeStyle = effect.kind === "wall-trap" ? "#ffd36a" : "#ff4d30";
    ctx.lineWidth = effect.kind === "wall-trap" ? 5 : 6;
    ctx.lineCap = "round";
    for (let i = 0; i < rayCount; i += 1) {
      const angle = (Math.PI * 2 * i) / rayCount + progress * 0.8;
      const inner = effect.radius * (effect.kind === "wall-trap" ? 0.08 : 0.18)
        + effect.radius * 0.12 * Math.sin(progress * Math.PI);
      const outer = effect.radius * (effect.kind === "wall-trap" ? 0.36 : 0.52)
        + effect.radius * grow * (effect.kind === "wall-trap" ? 0.62 : 0.45);
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * inner, Math.sin(angle) * inner);
      ctx.lineTo(Math.cos(angle) * outer, Math.sin(angle) * outer);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawPointBombArmingEffect(effect) {
    const pulse = 0.5 + 0.5 * Math.sin(performance.now() / 100);
    drawBombIcon(effect.x, effect.y, "", 1.08 + pulse * 0.08);
  }

  function drawReinforcementEffect() {
    const effect = battle.reinforcementEffect;
    if (!effect) return;

    const progress = Math.min(1, effect.elapsed / effect.duration);
    const fadeIn = Math.min(1, progress / 0.22);
    const fadeOut = progress > 0.78 ? Math.max(0, 1 - (progress - 0.78) / 0.22) : 1;
    const alpha = fadeIn * fadeOut;
    const y = field.height * 0.58;
    const bandHeight = 88;
    const pulse = Math.sin(progress * Math.PI);

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = "rgba(0, 0, 0, 0.62)";
    ctx.fillRect(field.padding, y - bandHeight / 2, field.width - field.padding * 2, bandHeight);

    ctx.globalAlpha = alpha * 0.9;
    ctx.strokeStyle = "rgba(255, 211, 106, 0.72)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(field.padding + 16, y - bandHeight / 2 + 8);
    ctx.lineTo(field.width - field.padding - 16, y - bandHeight / 2 + 8);
    ctx.moveTo(field.padding + 16, y + bandHeight / 2 - 8);
    ctx.lineTo(field.width - field.padding - 16, y + bandHeight / 2 - 8);
    ctx.stroke();

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `900 ${46 + pulse * 4}px Segoe UI, sans-serif`;
    ctx.lineWidth = 9;
    ctx.strokeStyle = "rgba(13, 16, 22, 0.96)";
    ctx.fillStyle = "#ffd36a";
    ctx.strokeText("増援", field.width / 2, y);
    ctx.fillText("増援", field.width / 2, y);

    ctx.restore();
  }

  function drawDefeatEffect() {
    const effect = battle.defeatEffect;
    if (!effect) return;

    const progress = Math.min(1, effect.elapsed / effect.duration);
    const crackProgress = Math.min(1, progress / 0.42);
    const burstProgress = Math.max(0, (progress - 0.24) / 0.76);
    const fade = Math.max(0, 1 - progress);
    const isAnnouncement = effect.mode === "announce";

    for (const defeated of effect.medals) {
      ctx.save();
      ctx.translate(defeated.x, defeated.y);

      ctx.globalAlpha = 0.9 * fade + 0.1;
      ctx.beginPath();
      ctx.arc(0, 0, defeated.radius, 0, Math.PI * 2);
      ctx.fillStyle = defeated.team === "ally" ? "#f4f7fb" : "#101010";
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = defeated.team === "ally" ? "#7ac7d8" : "#ff6f6f";
      ctx.stroke();

      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = "#f8f0d8";
      ctx.lineWidth = 3;
      const cracks = [
        [[0, -defeated.radius * 0.75], [-7, -20], [10, -4], [-3, defeated.radius * 0.36]],
        [[-defeated.radius * 0.65, -8], [-24, -2], [-7, 9], [-17, 28]],
        [[defeated.radius * 0.58, -15], [28, -6], [12, 12], [25, 31]],
        [[-18, -defeated.radius * 0.5], [-5, -26], [-15, -12], [-2, 0]],
      ];
      for (const crack of cracks) {
        ctx.beginPath();
        for (let i = 0; i < crack.length; i += 1) {
          const pointProgress = i / (crack.length - 1);
          if (pointProgress > crackProgress) break;
          const [x, y] = crack[i];
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      if (!isAnnouncement) {
        const shards = [
          { x: -0.8, y: -0.55, r: -0.25, s: 1.0 },
          { x: 0.75, y: -0.5, r: 0.42, s: 0.92 },
          { x: -0.62, y: 0.52, r: 0.28, s: 0.86 },
          { x: 0.55, y: 0.58, r: -0.4, s: 0.82 },
          { x: 0.02, y: -0.92, r: 0.1, s: 0.7 },
        ];
        ctx.globalAlpha = Math.max(0, 1 - burstProgress * 0.8);
        for (const shard of shards) {
          const ox = shard.x * defeated.radius * burstProgress * 0.72;
          const oy = shard.y * defeated.radius * burstProgress * 0.72;
          ctx.save();
          ctx.translate(ox, oy);
          ctx.rotate(shard.r * burstProgress);
          ctx.scale(shard.s, shard.s);
          ctx.beginPath();
          ctx.moveTo(0, -defeated.radius * 0.28);
          ctx.lineTo(defeated.radius * 0.23, defeated.radius * 0.2);
          ctx.lineTo(-defeated.radius * 0.23, defeated.radius * 0.2);
          ctx.closePath();
          ctx.fillStyle = "#191b22";
          ctx.fill();
          ctx.strokeStyle = "#f8f0d8";
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.restore();
        }
      }

      if (isAnnouncement) {
        ctx.globalAlpha = Math.min(1, progress * 3) * fade;
        ctx.font = "900 34px Segoe UI, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.lineWidth = 7;
        ctx.strokeStyle = "#111318";
        ctx.strokeText("撃破！", 0, -defeated.radius - 26 - progress * 10);
        ctx.fillStyle = "#ffd36a";
        ctx.fillText("撃破！", 0, -defeated.radius - 26 - progress * 10);
      }

      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }

  function drawCommandSkillPreviewRange(medal, options = {}) {
    const radius = commandSkillPreviewRadius(medal);
    if (!radius) return;
    const alpha = options.alpha ?? 0.5;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = alpha * 0.18;
    ctx.fillStyle = "#7ae2ff";
    ctx.beginPath();
    ctx.arc(medal.x, medal.y, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = alpha;
    ctx.strokeStyle = "#7ae2ff";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(medal.x, medal.y, radius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.globalAlpha = alpha * 0.55;
    ctx.setLineDash([10, 8]);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(medal.x, medal.y, radius + 7, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  function drawActiveCommandSkillPreviewRange() {
    const medal = battle.movingMedal;
    if (!medal || medal.team !== "ally" || !shouldShowActiveCommandSkillPreview(medal)) return;
    drawCommandSkillPreviewRange(medal, { alpha: 0.58 });
  }

  function isAxisAlignedLaunchArrow(dx, dy) {
    return Math.abs(dx) <= AXIS_ALIGNED_ARROW_PIXEL_EPSILON
      || Math.abs(dy) <= AXIS_ALIGNED_ARROW_PIXEL_EPSILON;
  }

  function drawDragArrow() {
    if (!battle.dragging || !battle.dragNow) return;
    const medal = activeMedal();
    const dx = medal.x - battle.dragNow.x;
    const dy = medal.y - battle.dragNow.y;
    const len = Math.hypot(dx, dy);
    if (len < MIN_LAUNCH_PULL_DISTANCE) return;

    const nx = dx / len;
    const ny = dy / len;
    const startX = medal.x;
    const startY = medal.y;
    const visiblePull = Math.max(0, len - MIN_LAUNCH_PULL_DISTANCE);
    const arrowLength = Math.min(MAX_LAUNCH_ARROW_LENGTH, LAUNCH_ARROW_START_LENGTH + visiblePull * LAUNCH_ARROW_GROWTH);
    const endX = medal.x + nx * arrowLength;
    const endY = medal.y + ny * arrowLength;
    const arrowColor = isAxisAlignedLaunchArrow(dx, dy) ? "#66e7ff" : "#e0b85c";

    ctx.strokeStyle = arrowColor;
    ctx.fillStyle = arrowColor;
    ctx.lineWidth = 7;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    const angle = Math.atan2(ny, nx);
    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(endX - Math.cos(angle - 0.55) * 24, endY - Math.sin(angle - 0.55) * 24);
    ctx.lineTo(endX - Math.cos(angle + 0.55) * 24, endY - Math.sin(angle + 0.55) * 24);
    ctx.closePath();
    ctx.fill();

    if (shouldShowCommandSkillPreview(medal)) {
      drawCommandSkillPreviewRange(medal, { alpha: 0.58 });
    } else if (!isCommandSkillStandby(medal)) {
      ctx.strokeStyle = "rgba(224, 184, 92, 0.35)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(medal.x, medal.y, medal.range, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  function drawEnemyActionArrow() {
    const action = battle.enemyAction;
    if (!action || action.stage !== "arrow") return;
    const enemy = battle.medals.find((m) => m.id === action.enemyId && m.hp > 0);
    if (!enemy) return;

    const startX = enemy.x;
    const startY = enemy.y;
    const arrowLength = 175;
    const endX = startX + action.dirX * arrowLength;
    const endY = startY + action.dirY * arrowLength;

    ctx.save();
    ctx.strokeStyle = "#ff4040";
    ctx.fillStyle = "#ff4040";
    ctx.lineWidth = 7;
    ctx.lineCap = "round";
    ctx.globalAlpha = 0.88;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    const angle = Math.atan2(action.dirY, action.dirX);
    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(endX - Math.cos(angle - 0.55) * 25, endY - Math.sin(angle - 0.55) * 25);
    ctx.lineTo(endX - Math.cos(angle + 0.55) * 25, endY - Math.sin(angle + 0.55) * 25);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function drawComboCounter() {
    if (battle.comboCount <= 0) return;

    const visibleCombo = Math.max(1, Math.min(battle.comboCount, Math.round(battle.comboDisplayCount || 0)));
    const numberText = String(visibleCombo);
    const labelText = "Combo";

    ctx.save();
    ctx.translate(field.padding + 18, field.padding + 72);
    ctx.rotate((-10 * Math.PI) / 180);
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.strokeStyle = "rgba(13, 16, 22, 0.94)";

    ctx.font = "900 45px Segoe UI, sans-serif";
    ctx.lineWidth = 9;
    ctx.strokeText(numberText, 0, 0);
    ctx.fillStyle = "#ffd36a";
    ctx.fillText(numberText, 0, 0);

    const numberWidth = ctx.measureText(numberText).width;
    ctx.font = "900 21px Segoe UI, sans-serif";
    ctx.lineWidth = 6;
    ctx.strokeStyle = "rgba(13, 16, 22, 0.94)";
    ctx.strokeText(labelText, numberWidth + 8, 8);
    ctx.fillStyle = "#ffd36a";
    ctx.fillText(labelText, numberWidth + 8, 8);

    ctx.restore();
  }

  function drawQuestHud() {
    const y = field.padding + 16;
    const centerText = questRoundHudLabel();
    const reinforcementLabel = "増援";
    const reinforcementNumber = String(remainingReinforcementCount()).padStart(2, "0");

    ctx.save();
    ctx.textBaseline = "middle";

    ctx.textAlign = "center";
    ctx.font = "900 28px Segoe UI, sans-serif";
    ctx.lineWidth = 7;
    ctx.strokeStyle = "rgba(13, 16, 22, 0.92)";
    ctx.fillStyle = "#ffe18a";
    ctx.strokeText(centerText, field.width / 2, y);
    ctx.fillText(centerText, field.width / 2, y);

    const right = field.width - field.padding - 6;
    ctx.textAlign = "right";
    ctx.font = "900 42px Segoe UI, sans-serif";
    ctx.lineWidth = 10;
    ctx.strokeStyle = "rgba(13, 16, 22, 0.92)";
    ctx.fillStyle = "#f5f7fb";
    ctx.strokeText(reinforcementNumber, right, y);
    ctx.fillText(reinforcementNumber, right, y);

    const numberWidth = ctx.measureText(reinforcementNumber).width;
    ctx.font = "600 25px 'Yu Mincho', 'MS Mincho', serif";
    ctx.lineWidth = 4;
    ctx.strokeStyle = "rgba(13, 16, 22, 0.9)";
    ctx.fillStyle = "#f5f7fb";
    ctx.strokeText(reinforcementLabel, right - numberWidth - 8, y + 1);
    ctx.fillText(reinforcementLabel, right - numberWidth - 8, y + 1);

    ctx.restore();
  }

  function drawRoundBannerEffect() {
    const effect = battle.roundBannerEffect;
    if (!effect) return;

    const progress = Math.min(1, effect.elapsed / effect.duration);
    const fadeIn = Math.min(1, progress / 0.18);
    const fadeOut = progress > 0.72 ? Math.max(0, 1 - (progress - 0.72) / 0.28) : 1;
    const alpha = fadeIn * fadeOut;
    const pulse = Math.sin(progress * Math.PI);
    const y = field.height * 0.5;
    const bandHeight = effect.text === "YOU WIN !" ? 104 : 86;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = "rgba(0, 0, 0, 0.62)";
    ctx.fillRect(field.padding, y - bandHeight / 2, field.width - field.padding * 2, bandHeight);
    ctx.strokeStyle = effect.text === "YOU WIN !" ? "rgba(255, 242, 166, 0.86)" : "rgba(122, 226, 255, 0.78)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(field.padding + 18, y - bandHeight / 2 + 8);
    ctx.lineTo(field.width - field.padding - 18, y - bandHeight / 2 + 8);
    ctx.moveTo(field.padding + 18, y + bandHeight / 2 - 8);
    ctx.lineTo(field.width - field.padding - 18, y + bandHeight / 2 - 8);
    ctx.stroke();

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `900 ${effect.text === "YOU WIN !" ? 50 + pulse * 8 : 42 + pulse * 5}px Segoe UI, sans-serif`;
    ctx.lineWidth = 10;
    ctx.strokeStyle = "rgba(13, 16, 22, 0.96)";
    ctx.fillStyle = effect.text === "YOU WIN !" ? "#fff2a6" : "#d9f7ff";
    ctx.strokeText(effect.text, field.width / 2, y - 2);
    ctx.fillText(effect.text, field.width / 2, y - 2);
    ctx.restore();
  }

  function drawRoundTransitionEffect() {
    const effect = battle.roundTransitionEffect;
    if (!effect) return;
    const progress = Math.min(1, effect.elapsed / effect.duration);
    const alpha = Math.sin(progress * Math.PI);
    ctx.save();
    ctx.globalAlpha = Math.min(1, alpha);
    ctx.fillStyle = "#05070c";
    ctx.fillRect(0, 0, field.width, field.height);
    ctx.restore();
  }

  function drawOneMoreEffect() {
    const effect = battle.oneMoreEffect;
    if (!effect) return;

    const progress = Math.min(1, effect.elapsed / effect.duration);
    const fadeIn = Math.min(1, progress / 0.18);
    const fadeOut = progress > 0.68 ? Math.max(0, 1 - (progress - 0.68) / 0.32) : 1;
    const alpha = fadeIn * fadeOut;
    const pulse = Math.sin(progress * Math.PI);
    const text = "撃破1more！";
    const y = field.height * 0.42 - pulse * 10;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `900 ${42 + pulse * 6}px Segoe UI, sans-serif`;
    ctx.lineWidth = 10;
    ctx.strokeStyle = "rgba(13, 16, 22, 0.95)";
    ctx.fillStyle = "#fff2a6";
    ctx.strokeText(text, field.width / 2, y);
    ctx.fillText(text, field.width / 2, y);
    ctx.restore();
  }

  function drawNextTurnEffect() {
    const effect = battle.nextTurnEffect;
    if (!effect) return;

    const progress = Math.min(1, effect.elapsed / effect.duration);
    const fadeIn = Math.min(1, progress / 0.2);
    const fadeOut = progress > 0.72 ? Math.max(0, 1 - (progress - 0.72) / 0.28) : 1;
    const alpha = fadeIn * fadeOut;
    const y = field.height * 0.5;
    const bandHeight = 76;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = "rgba(0, 0, 0, 0.58)";
    ctx.fillRect(field.padding, y - bandHeight / 2, field.width - field.padding * 2, bandHeight);
    ctx.strokeStyle = "rgba(122, 226, 255, 0.78)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(field.padding + 18, y - bandHeight / 2 + 8);
    ctx.lineTo(field.width - field.padding - 18, y - bandHeight / 2 + 8);
    ctx.moveTo(field.padding + 18, y + bandHeight / 2 - 8);
    ctx.lineTo(field.width - field.padding - 18, y + bandHeight / 2 - 8);
    ctx.stroke();

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "900 38px Segoe UI, sans-serif";
    ctx.lineWidth = 8;
    ctx.strokeStyle = "rgba(13, 16, 22, 0.96)";
    ctx.fillStyle = "#d9f7ff";
    ctx.strokeText("Next Turn", field.width / 2, y - 2);
    ctx.fillText("Next Turn", field.width / 2, y - 2);
    ctx.restore();
  }

  function draw() {
    drawField();
    for (const medal of battle.medals.filter((m) => m.team === "enemy")) drawMedal(medal);
    for (const medal of battle.medals.filter((m) => m.team === "ally")) drawMedal(medal);
    drawActiveCommandSkillPreviewRange();
    drawBombMarker();
    drawBombTargetingRings();
    drawSmashEffect();
    drawCommandSkillEffect();
    drawTimeStopEffect();
    drawRushEffect();
    drawBombClickEffect();
    drawBombExplosionEffect();
    drawWallTrapEffects();
    drawImpactEffects();
    drawDogoEffects();
    drawDodgeEffects();
    drawDefeatEffect();
    drawReinforcementEffect();
    drawEnemyActionArrow();
    drawDragArrow();
    drawQuestHud();
    drawComboCounter();
    drawOneMoreEffect();
    drawNextTurnEffect();
    drawRoundTransitionEffect();
    drawRoundBannerEffect();
    drawDamageNumbers();
  }

  function frame(now) {
    const dt = Math.min(0.033, (now - battle.lastTime) / 1000);
    battle.lastTime = now;
    update(dt);
    draw();
    requestAnimationFrame(frame);
  }

  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerup", onPointerUp);
  canvas.addEventListener("pointercancel", onPointerCancel);
  window.addEventListener?.("pointerup", onPointerUp);
  window.addEventListener?.("pointercancel", onPointerCancel);
  document.addEventListener("pointerdown", (event) => {
    if (!battle.detailOpen) return;
    if (partyDetail?.contains(event.target) || partyCards?.contains(event.target)) return;
    hidePartyDetail();
  });
  resetButton.addEventListener("click", resetBattle);

  resetBattle();
  requestAnimationFrame(frame);
})();
