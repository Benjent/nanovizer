import { defineStore } from 'pinia'
import axios from '../libs/axios'
import showcase from '../showcase/showcase-hiv.json'

const useMainStore = defineStore('main', {
    state: () => ({
        theme: 'dark',
        isContrasted: false,
        fileName: '',
        genomeName: '',
        genomeSize: undefined,
        minReadLength: undefined,
        minBlockPosition3: undefined,
        minBlockPosition5: undefined,
        maxBlockPosition5: undefined,
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
                    min_position_3: this.minBlockPosition3,
                    min_position_5: this.minBlockPosition5,
                    max_position_5: this.maxBlockPosition5,
                }
    
                const response = await axios.post('/parse-file', params)
                this.nanoVizerData = response.data
            } catch (error) {
                this.isError = true
            }
            
            this.isLoading = false
        },
        useShowcaseData() {
            const showcaseResponse = showcase

            this.fileName = 'showcase_hiv'
            this.genomeName = 'genome'
            this.genomeSize = 10000
            this.minBlockPosition3 = undefined
            this.minBlockPosition5 = undefined
            this.maxBlockPosition5 = undefined

            this.nanoVizerData = showcaseResponse.data
        },
    },
})

export { useMainStore }
