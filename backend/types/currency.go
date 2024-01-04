package types

type Currency string

const (
	USD Currency = "USD"
	EUR Currency = "EUR"
	GBP Currency = "GBP"
	PLN Currency = "PLN"
)

func (c Currency) String() string {
	return string(c)
}
