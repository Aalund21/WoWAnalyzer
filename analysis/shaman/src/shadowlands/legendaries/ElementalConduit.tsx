import { formatDuration } from 'common/format';
import SPELLS from 'common/SPELLS';
import HIT_TYPES from 'game/HIT_TYPES';
import CooldownIcon from 'interface/icons/Cooldown';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

const cooldownDecrease = 1000;

class ElementalConduit extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;
  protected totalCdrGained = 0;
  protected totalCdrWasted = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasLegendary(SPELLS.ELEMENTAL_CONDUIT);

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.FLAME_SHOCK),
      this.reduceChanShockCooldown,
    );
  }

  reduceChanShockCooldown(event: DamageEvent) {
    if (event.hitType !== HIT_TYPES.CRIT) {
      return;
    }

    if (this.spellUsable.isOnCooldown(SPELLS.CHAIN_HARVEST.id)) {
      this.spellUsable.reduceCooldown(SPELLS.CHAIN_HARVEST.id, cooldownDecrease, event.timestamp);
      this.totalCdrGained += cooldownDecrease;
    } else {
      this.totalCdrWasted += cooldownDecrease;
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(10)}
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
      >
        <BoringSpellValueText spellId={SPELLS.ELEMENTAL_CONDUIT.id}>
          <CooldownIcon /> {formatDuration(this.totalCdrGained)}s{' '}
          <small> of Chain Harvest CDR</small>
          <br />
          <CooldownIcon /> {formatDuration(this.totalCdrWasted)}s{' '}
          <small> of Chain Harvest CDR wasted</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default ElementalConduit;
