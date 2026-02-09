import { motion } from 'framer-motion'

export type MetricsCardsProps = {
  epoch: number
  generatorLoss: number
  discriminatorLoss: number
  psnr: number
}

export function MetricsCards({
  epoch,
  generatorLoss,
  discriminatorLoss,
  psnr,
}: MetricsCardsProps) {
  const cards = [
    { label: 'Current Epoch', value: epoch, color: 'text-slate-200', decimals: 0 },
    { label: 'Generator Loss', value: generatorLoss, color: 'text-violet-400', decimals: 4 },
    { label: 'Discriminator Loss', value: discriminatorLoss, color: 'text-pink-400', decimals: 4 },
    { label: 'PSNR', value: psnr, color: 'text-emerald-400', decimals: 2 },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <motion.div
          key={card.label}
          className="rounded-xl border border-slate-600 bg-slate-800 p-4 shadow-lg"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="text-xs uppercase tracking-wider text-slate-400 mb-1">
            {card.label}
          </div>
          <motion.div
            className={`text-2xl font-semibold ${card.color}`}
            key={`${card.label}-${card.value}`}
            initial={{ scale: 1.05 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            {card.value.toFixed(card.decimals)}
          </motion.div>
        </motion.div>
      ))}
    </div>
  )
}
