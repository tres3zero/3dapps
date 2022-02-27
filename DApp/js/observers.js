const from  = rxjs.from
const takeUntil = rxjs.takeUntil

const anyProviderObserver = {
    next: provider => {
 //       const providerWrapper = new ethers.providers.Web3Provider(provider)
 //       const providerWrapper = new ethers.getDefaultProvider('ropsten')
        const providerWrapper = ethers.getDefaultProvider('https://data-seed-prebsc-1-s1.binance.org:8545/')
        const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, providerWrapper)
        setGlobalStatisticsEvents(contract)
    },
    complete: () => {
        onNoWalletsConnected()
    }
}

const walletChoosingObserver = {
    next: provider => {
        const providerWrapper = new ethers.providers.Web3Provider(provider)
        const signer = providerWrapper.getSigner()
        const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer)

        const accountsChangeObservable = accountsChangeObservableFactory(provider)
        accountsChangeObservable.subscribe(accounts => setPersonalStatisticsEvents(providerWrapper, contract, accounts[0]))
        const requestAccountObservable = from(requestAccounts(provider)).pipe(takeUntil(accountsChangeObservable)) 
        requestAccountObservable.subscribe(accounts => setPersonalStatisticsEvents(providerWrapper, contract, accounts[0]))
        
        
    }
}
