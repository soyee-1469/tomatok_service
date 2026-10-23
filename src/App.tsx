import { Navigate, Route, Routes } from 'react-router-dom'
import { EmoticonRoutes } from './emoticon/EmoticonScreens'
import { EmoticonProvider } from './emoticon/store'
import { ServicesHome, TranslateScreen } from './translate/TranslateScreens'
import {
  WalletActionPlaceholder,
  WalletAdd,
  WalletAll,
  WalletExchangeScreen,
  WalletHome,
  WalletIdRedirect,
  WalletProvider,
} from './wallet/WalletScreens'
import {
  WalletNftDetail,
  WalletNftList,
  WalletTxDetail,
  WalletTxList,
} from './wallet/WalletBrowseScreens'
import './wallet.css'

export default function App() {
  return (
    <WalletProvider>
      <EmoticonProvider>
        <div className="stage">
          <Routes>
            <Route path="/" element={<Navigate to="/services" replace />} />
            <Route path="/services" element={<ServicesHome />} />
            <Route path="/services/translate" element={<TranslateScreen />} />
            <Route path="/emoticon/*" element={<EmoticonRoutes />} />

            <Route path="/wallet" element={<WalletHome />} />
            <Route path="/wallet/all" element={<WalletAll />} />
            <Route path="/wallet/add" element={<WalletAdd />} />
            <Route path="/wallet/:id/exchange" element={<WalletExchangeScreen />} />
            <Route path="/wallet/:id/nfts/:nftId" element={<WalletNftDetail />} />
            <Route path="/wallet/:id/nfts" element={<WalletNftList />} />
            <Route path="/wallet/:id/txs/:txId" element={<WalletTxDetail />} />
            <Route path="/wallet/:id/txs" element={<WalletTxList />} />
            <Route path="/wallet/:id/send" element={<WalletActionPlaceholder />} />
            <Route path="/wallet/:id/receive" element={<WalletActionPlaceholder />} />
            <Route path="/wallet/:id/fill" element={<WalletActionPlaceholder />} />
            <Route path="/wallet/:id" element={<WalletIdRedirect />} />

            <Route path="*" element={<Navigate to="/services" replace />} />
          </Routes>
        </div>
      </EmoticonProvider>
    </WalletProvider>
  )
}
