import { defineStore } from 'pinia'
import axios from '../libs/axios'
import showcaseNew from '../showcase/showcase-hiv.json'

const useMainStore = defineStore('main', {
    state: () => ({
        theme: 'dark',
        isContrasted: false,
        fileName: '',
        genomeName: '',
        genomeSize: undefined,
        minReadLength: undefined,
        minPosition3: undefined,
        minPosition5: undefined,
        maxPosition5: undefined,
        nanoVizerData: undefined,
        isLoading: false,
        isError: false,
    }),
    getters: {
        isFileNameValid: (state) => {
            return state.fileName && state.fileName.length > 0
        },
    },
    actions: {
        getGenomes() {
            this.isLoadingGenomes = true
            this.isError = false

            axios.get('/genomes')
            .then((response) => {
                localStorage.setItem(this.fileName, JSON.stringify(response.data))
            })
        },
        startAgain() {
            this.isFileLoaded = false
            this.nanoVizerData = undefined
            window.scrollTo(0, 0)
        },
        async triggerParsing() {
            this.isLoading = true
            this.isError = false

            try {
                const params = {
                    file_name: this.fileName,
                    genome_name: this.genomeName,
                    genome_size: this.genomeSize,
                    min_read_length: this.minReadLength,
                    min_position_3: this.minPosition3,
                    min_position_5: this.minPosition5,
                    max_position_5: this.maxPosition5,
                }
    
                const response = await axios.post('/parse-file', params)
                this.nanoVizerData = response.data
            } catch (error) {
                this.isError = true
            }
            
            this.isLoading = false
        },
        useShowcaseData() {
            const isShowcaseBig = false && Math.random() < 0.5
            const showcaseResponse = showcaseNew

            this.fileName = 'showcase_hiv'
            this.genomeName = 'genome'
            this.genomeSize = isShowcaseBig ? 30000 : 2000
            this.minPosition3 = undefined
            this.minPosition5 = undefined
            this.maxPosition5 = undefined

            this.nanoVizerData = showcaseResponse.data
        },
    },
})

export { useMainStore }
